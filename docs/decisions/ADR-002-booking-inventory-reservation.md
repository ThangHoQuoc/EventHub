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
- Future Payment/Concurrency work must re-check inventory before confirming a booking.
- Future confirmation must increment `soldQuantity` inside a transaction.
- Future confirmation must be idempotent so repeated payment callbacks cannot sell twice.
- A later phase may introduce `reservedQuantity` or compute active reservations from
  `PENDING_PAYMENT` bookings with expiration.

## Follow-up Work

Recommended next backend slice:

```text
Payment SUCCESS / confirm booking
  -> load booking
  -> reject non-PENDING_PAYMENT
  -> re-check inventory
  -> increment soldQuantity transactionally
  -> set booking CONFIRMED
  -> make confirmation idempotent
```
