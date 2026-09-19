# ADR-002: Booking Inventory Reservation Boundary

## Status
Accepted

## Date
2026-09-19

## Context
EventHub now supports basic customer bookings. A customer can create a `PENDING_PAYMENT`
booking with one or more `BookingItem` rows. Each item preserves purchase-time
`unitPrice` and `subtotal`.

Inventory is the sensitive part of the booking flow. If two customers try to buy the
last ticket at the same time, a naive implementation can oversell. However, reserving
or decrementing inventory before Payment exists creates another problem: abandoned
pending bookings can hold tickets forever unless expiration and release rules exist.

## Decision
For the current Booking phase, creating a `PENDING_PAYMENT` booking does not reserve
inventory and does not increment `TicketType.soldQuantity`.

Current rules:

- `TicketType.quantity` is total sellable capacity.
- `TicketType.soldQuantity` means confirmed sold quantity only.
- `PENDING_PAYMENT` booking is a purchase intent, not a confirmed sale.
- Basic availability check uses `quantity - soldQuantity`.
- `BookingItem.unitPrice` and `BookingItem.subtotal` preserve purchase-time pricing.
- Payment/confirmation will be responsible for the final inventory mutation.

The current behavior is locked by a service test:

```text
createBooking_shouldNotIncreaseSoldQuantityForPendingPaymentBooking
```

## Alternatives Considered

### Reserve inventory when booking is created

This would make customer checkout feel closer to production ticketing systems.

Rejected for now because it requires additional rules that do not exist yet:

- pending booking expiration
- inventory release on timeout/cancel
- concurrency locking around reserve/release
- idempotent payment confirmation
- clear handling for payment success after expiration

### Increment soldQuantity when booking is created

Rejected because `soldQuantity` would no longer mean confirmed sales. A customer could
create a booking and never pay, but the system would still count the ticket as sold.

## Consequences

- Current Booking APIs are not a complete oversell-prevention system.
- Payment confirmation re-checks inventory before confirming a booking.
- Payment confirmation increments `soldQuantity` inside a transaction.
- Payment confirmation is idempotent for repeated successful provider transaction references.
- A later phase may introduce `reservedQuantity` or compute active reservations from
  `PENDING_PAYMENT` bookings with expiration.

## Implementation Note

PR6-PR7 added a payment foundation and manual/admin confirmation endpoint:

```text
POST /api/v1/payments/confirm
```

Current confirmation behavior:

- load booking
- reject non-`PENDING_PAYMENT` bookings
- re-check inventory
- increment `TicketType.soldQuantity`
- set booking to `CONFIRMED`
- store a successful `Payment`
- return the existing successful `Payment` when the same provider transaction is replayed

This is still not the final provider/webhook implementation. Real payment provider
checkout, callback signature verification, payment expiration, and stronger concurrent
inventory locking are deferred.

## Follow-up Work

Recommended next backend slices:

```text
Real payment provider integration
  -> create payment intent / payment URL or QR
  -> verify callback/webhook signature
  -> map provider statuses safely
  -> keep confirm operation idempotent

Concurrency hardening
  -> choose optimistic/pessimistic/atomic update strategy
  -> prevent oversell under simultaneous confirmations
  -> add integration tests around the final strategy
```
