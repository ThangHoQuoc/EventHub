# EventHub — Project Master Documentation

> **Purpose:** Source of truth for AI assistants working on EventHub.
> AI must read this document before modifying code. Do not invent architecture, entities, business rules, endpoints, or technologies that conflict with this document.
>
> **Current phase:** Phase 5 — Booking.
>
> **Status rule:** `DONE` means implemented/substantially implemented. `IN PROGRESS` and `TODO` are planned/pending and must not be assumed to exist.

---

## 1. Project Overview

**EventHub** is a backend-focused event ticketing and booking platform inspired by products such as Ticketbox, but intentionally designed to go beyond a basic CRUD project.

Main roles:

- `CUSTOMER`
- `ORGANIZER`
- `ADMIN`

Core business:

```text
CUSTOMER
  -> discover events
  -> use EventMatch to find events by intent
  -> choose ticket type
  -> booking
  -> payment
  -> receive ticket + QR
  -> check in

ORGANIZER
  -> create/manage events
  -> configure ticket types/inventory
  -> receive AI assistance for event creation/marketing

ADMIN
  -> moderate/manage users and events
  -> approve/reject events
  -> manage operational data
```

The project is intended as a Junior/Fresher Backend Java portfolio project. Its value is not the number of endpoints, but the demonstration of real backend engineering:

- JWT authentication and authorization
- RBAC + resource ownership authorization
- Event state/lifecycle management
- DTO/entity separation
- JPA/Hibernate
- Transactions
- Inventory consistency
- Concurrency/race-condition handling
- Idempotency
- Payment workflow
- Buyer-side AI event matching
- Smart waitlist / sold-out demand recovery
- Event-driven architecture
- Kafka
- Redis
- AI integration
- Docker/CI/CD

---

# 2. Why EventHub Is Stronger Than a Typical CRUD Project

A typical student ticketing project may be:

```text
Event CRUD
  -> Ticket CRUD
  -> Order CRUD
  -> Database
```

EventHub is designed around business flows and real system problems.

Examples:

### Event lifecycle

```text
DRAFT -> PUBLISHED -> COMPLETED
DRAFT/PUBLISHED -> CANCELLED
```

### Ticket inventory

Inventory cannot simply be incremented/decremented without considering concurrent requests.

### Buyer-side discovery

Customers often search by intent rather than exact event names:

```text
"Beginner-friendly tech event in HCMC this weekend, under 300k, good for networking"
```

EventHub should translate that intent into structured preferences, then let backend search/ranking return real events.

### Booking

Booking is not just inserting an order row. It must consider:

- ticket availability
- concurrent purchases
- transaction boundaries
- booking/payment state
- idempotency
- inventory consistency

### Authorization

An Organizer may have the `ORGANIZER` role but still must not modify another Organizer's Event.

This makes the project much stronger for backend interviews than a simple CRUD application.

---

# 3. Main Differentiating Features

## 3.1 Resource Ownership Authorization

EventHub uses both:

- Role-Based Access Control (RBAC)
- Resource/ownership-based authorization

Example:

```text
ORGANIZER A -> Event A -> TicketTypes A
ORGANIZER B -> Event B -> TicketTypes B
```

Organizer A must not modify Organizer B's resources.

Admin can override/manage resources according to the business rules.

This demonstrates authorization beyond simple `hasRole()` checks.

---

## 3.2 Event Lifecycle

Current `EventStatus`:

```text
DRAFT
PUBLISHED
CANCELLED
COMPLETED
```

Lifecycle:

```text
                    DRAFT
                      |
                   Publish
                      v
                  PUBLISHED
                      |
                 endAt reached
                      v
                  COMPLETED

DRAFT/PUBLISHED
       |
     Cancel
       v
  CANCELLED
```

A scheduled backend job automatically completes expired published events.

This demonstrates backend-driven business lifecycle logic rather than relying only on frontend actions.

---

## 3.3 TicketType vs Ticket

Important domain decision:

**TicketType is not an individual ticket.**

`TicketType` is a sellable category/inventory definition:

```text
Event
  ├── VIP
  ├── Standard
  └── Student
```

Example:

```text
VIP
price = 500000
quantity = 100
soldQuantity = 25
availableQuantity = 75
```

Formula:

```text
availableQuantity = quantity - soldQuantity
```

`availableQuantity` is derived and should not normally be stored independently.

Later, a separate `Ticket` entity represents the actual issued ticket.

```text
TicketType = what kind of ticket is sold
Ticket     = actual ticket issued to a customer
```

---

# 4. Booking — Key Backend Differentiator

Booking is intentionally one of the strongest backend sections.

Example:

```text
Only 1 ticket remains.

Customer A -> buys 1
Customer B -> buys 1

Requests arrive almost simultaneously.
```

A naive implementation can oversell.

EventHub should eventually solve this using appropriate mechanisms such as:

- database transactions
- optimistic/pessimistic locking where appropriate
- atomic inventory updates where appropriate
- correct isolation reasoning
- idempotency
- deadlock awareness

The exact mechanism must be chosen after analyzing the final schema and access pattern.

---

# 5. Payment Workflow

Target flow:

```text
Booking CREATED
      |
Payment PENDING
      |
QR/payment shown
      |
Customer pays
      |
Payment callback/webhook
      |
Verify payment
      |
Payment SUCCESS
      |
Booking CONFIRMED
      |
Generate Ticket
```

Important concerns:

- payment status
- booking status
- webhook verification
- duplicate callbacks
- idempotency
- timeout/expiration
- consistency between payment and booking

---

# 6. AI Differentiation

AI should not be added as a meaningless chatbot.

Decision record:

```text
docs/decisions/ADR-001-buyer-side-eventmatch-and-smart-waitlist.md
```

Main direction:

## EventMatch for Attendees

EventMatch is the flagship AI feature for the customer side.

Goal:

```text
Help buyers find events that match their real intent, not only exact keywords.
```

Example customer input:

```text
I want a beginner-friendly tech event in Ho Chi Minh City this weekend,
under 300k, good for networking.
```

AI responsibility:

```text
Natural language intent
  -> structured preferences
  -> optional explanation text
```

Example structured preferences:

```text
topic = tech
location = Ho Chi Minh City
dateRange = this weekend
maxBudget = 300000
audienceLevel = beginner
goal = networking
```

Backend responsibility:

```text
Validate AI output
Apply database filters
Check event status and ticket availability
Rank eligible events deterministically
Return only real events from the database
Cache/fallback where appropriate
```

Important rule:

**The LLM must not invent events or directly decide what the customer can buy.**

The backend remains the source of truth for:

- event existence
- event status
- ticket availability
- price
- authorization
- ranking constraints

MVP behavior:

- customer submits natural-language intent
- AI extracts structured preferences
- backend finds and ranks eligible published events
- response returns top matches with a short reason
- if AI fails, fallback to normal search/filter

Possible API:

```http
POST /api/v1/event-match
```

Possible response shape:

```json
{
  "query": "beginner tech event in HCMC this weekend under 300k",
  "preferences": {
    "topic": "tech",
    "location": "Ho Chi Minh City",
    "maxBudget": 300000,
    "audienceLevel": "beginner"
  },
  "results": [
    {
      "eventId": "event-123",
      "matchScore": 86,
      "reason": "Matches your tech topic, beginner level, location, and budget."
    }
  ]
}
```

Recommended implementation direction:

- Start with structured JSON output from an AI provider.
- Validate the parsed preferences using DTO validation.
- Use regular SQL/JPA queries first.
- Add PostgreSQL full-text search or vector search only after the MVP works.
- Track clicks/saves/bookings later as feedback signals.

Event metadata required before EventMatch becomes strong:

- category
- tags/topics
- audience level
- target audience
- event goal/format
- price range derived from TicketType

Not doing in MVP:

- no custom machine learning model
- no generic chatbot
- no AI-generated fake events
- no collaborative filtering until user behavior data exists
- no LLM-only ranking without backend validation

---

## Smart Waitlist for Sold-Out Ticket Demand

Smart Waitlist is the second standout feature and should be built after the booking/payment foundation exists.

Goal:

```text
When a ticket type is sold out, buyers can join a fair queue instead of leaving the platform.
```

When inventory becomes available because of:

- booking expiration
- payment failure
- cancellation/refund
- organizer adding capacity

the system can offer the next eligible buyer a time-limited reservation.

Core backend concerns:

- waitlist ordering and fairness
- duplicate join prevention
- time-limited reservation offers
- idempotent accept/skip/expire actions
- race-condition handling when inventory reappears
- notification event when an offer is created
- audit trail for queue movement

Possible flow:

```text
TicketType SOLD OUT
      |
Customer joins waitlist
      |
Inventory becomes available
      |
Backend selects next waitlist entry
      |
Reservation offer CREATED
      |
Customer accepts before expiration
      |
Booking/Payment continues
```

Possible APIs:

```http
POST /api/v1/ticket-types/{ticketTypeId}/waitlist
GET  /api/v1/me/waitlist
POST /api/v1/waitlist-offers/{offerId}/accept
POST /api/v1/waitlist-offers/{offerId}/skip
```

Smart Waitlist is not primarily an AI feature.
Its value is backend depth: transactions, scheduling, idempotency, fairness, and event-driven notification.

---

Secondary direction:

## AI Event Assistant for Organizers

Example input:

> I want to organize a Java workshop for FPT students, around 100 attendees.

AI can assist with:

```text
Event title
Event description
Target audience
Tags
Ticket type suggestions
Price suggestions
Marketing copy
```

Flow:

```text
Organizer
   |
Create Event
   |
AI Assistant
   |
Suggestions
   |
Organizer edits/accepts
   |
Save
```

The Organizer remains the decision maker.

This is useful, but it is secondary to buyer-side EventMatch because the current product direction prioritizes attendee value.

---

# 7. Architecture

Current target architecture:

```text
Controller
    |
Service
    |
Repository
    |
Database
```

DTO flow:

```text
Request DTO
    |
Controller
    |
Service
    |
Entity
    |
Repository
    |
Database

Entity
    |
MapStruct
    |
Response DTO
```

Cross-cutting concerns:

```text
Spring Security
JWT
Validation
Exception Handling
Transactions
Scheduling
```

Future infrastructure:

```text
Redis
Kafka
Payment Provider
Email
AI Provider
Docker
CI/CD
```

---

# 8. Technology Direction

Current/target stack:

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- SQL database
- Lombok
- MapStruct
- Jakarta Bean Validation
- Swagger/OpenAPI
- Postman

Planned:

- Redis
- Kafka
- AI integration
- Docker
- CI/CD
- Deployment

Do not claim a planned technology is already implemented.

---

# 9. ERD — Domain Decision

Core relationships:

```text
User 1:N Event
Event 1:N TicketType

User 1:N Booking
Booking 1:N BookingItem
BookingItem N:1 TicketType

Booking 1:N Payment
Booking 1:N Ticket

TicketType 1:N WaitlistEntry
WaitlistEntry 1:N WaitlistOffer
```

Detailed conceptual ERD:

```text
+-------------+
|    User     |
+-------------+
| id          |
| username    |
| password    |
| role        |
| status      |
+------+------+
       |
       | 1:N
       v
+----------------+
|     Event      |
+----------------+
| id             |
| title          |
| description    |
| thumbnailUrl   |
| location       |
| category       |
| tags/topics    |
| audienceLevel  |
| targetAudience |
| format/goal    |
| startAt        |
| endAt          |
| status         |
| organizer_id   |
+-------+--------+
        |
        | 1:N
        v
+------------------+
|    TicketType    |
+------------------+
| id               |
| name             |
| description      |
| price            |
| quantity         |
| soldQuantity     |
| event_id         |
+--------+---------+
         |
         | 1:N
         v
+------------------+
|   BookingItem    |
+------------------+
| id               |
| booking_id       |
| ticket_type_id   |
| quantity         |
| unitPrice        |
| subtotal          |
+--------+---------+
         |
         | N:1
         v
+------------------+
|     Booking      |
+------------------+
| id               |
| customer_id      |
| status           |
| totalAmount      |
| createdAt        |
+--------+---------+
         |
         +--------------< Payment
         |
         +--------------< Ticket
                              |
                              +-- ticketCode
                              +-- status
                              +-- QR data
                              +-- checkedInAt

TicketType
    |
    +--------------< WaitlistEntry
                         |
                         +--------------< WaitlistOffer
```

Important: `BookingItem` preserves purchase-time price (`unitPrice`) so later TicketType price changes do not alter historical purchases.

---

# 10. Entity Responsibilities

## User

Represents an account.

Responsibilities:

- authentication identity
- role
- account status
- Organizer ownership of Events
- Customer ownership of Bookings

Roles:

```text
ADMIN
ORGANIZER
CUSTOMER
```

Potential statuses:

```text
ACTIVE
BANNED
LOCKED
INACTIVE
```

Status validation inside JWT authentication is planned.

---

## Event

Represents an event created by an Organizer.

Fields currently established:

```text
id
title
description
thumbnailUrl
location
startAt
endAt
status
organizer
```

Planned discovery metadata for EventMatch:

```text
category
tags/topics
audienceLevel
targetAudience
format/goal
```

These fields are needed because AI-based discovery is only useful if the backend has reliable structured data to search and rank.
Do not implement EventMatch as a pure prompt-to-chatbot feature.

Relationship:

```text
Organizer/User 1:N Event
Event N:1 Organizer/User
Event 1:N TicketType
```

---

## TicketType

Represents a sellable ticket category.

Fields:

```text
id
name
description
price
quantity
soldQuantity
event
```

Rules:

- `price` -> `BigDecimal`
- `quantity` -> `Integer`
- `soldQuantity` -> `Integer`
- `soldQuantity` is backend-controlled
- new TicketType starts with `soldQuantity = 0`
- `availableQuantity = quantity - soldQuantity`
- TicketType belongs to one Event
- TicketType is not an individual Ticket

Recommended DB table name:

```text
ticket_types
```

rather than `tickets`, because a separate `Ticket` entity will exist later.

Current JPA relationship:

```java
@ManyToOne
@JoinColumn(name = "event_id")
Event event;
```

Event can have the inverse relationship:

```java
@OneToMany(mappedBy = "event")
List<TicketType> ticketTypes;
```

---

## Booking

Implemented entity representing a customer's purchase/reservation.

Responsibilities:

- Customer ownership
- booking status
- total amount
- creation time
- BookingItem relationship
- future inventory reservation
- future payment relationship

Current statuses:

```text
PENDING_PAYMENT
CONFIRMED
CANCELLED
EXPIRED
```

---

## BookingItem

Implemented entity representing each TicketType selection inside a Booking.

Example:

```text
Booking #100
  VIP x 2
  Standard x 1
  Student x 3
```

Must preserve relevant purchase-time pricing.

---

## Payment

Planned entity representing payment state for a Booking.

Responsibilities:

- payment status
- amount
- provider/reference information
- callback/webhook handling
- verification
- idempotency

---

## Ticket

Planned entity representing an actual issued ticket.

Possible fields:

```text
id
ticketCode
booking
ticketType
status
qrCode / QR payload
checkedInAt
```

Possible statuses:

```text
VALID
USED
CANCELLED
```

---

## WaitlistEntry

Planned entity representing a customer's position in the sold-out demand queue for a TicketType.

Possible fields:

```text
id
customer
ticketType
status
position / createdAt
createdAt
updatedAt
```

Possible statuses:

```text
WAITING
OFFERED
CONVERTED
SKIPPED
EXPIRED
CANCELLED
```

Rules:

- one active waitlist entry per customer per TicketType
- queue ordering must be deterministic
- customer must not bypass normal booking/payment rules
- waitlist does not guarantee a ticket

---

## WaitlistOffer

Planned entity representing a time-limited chance to reserve a newly available ticket.

Possible fields:

```text
id
waitlistEntry
ticketType
quantity
status
expiresAt
acceptedAt
createdAt
```

Possible statuses:

```text
CREATED
ACCEPTED
SKIPPED
EXPIRED
CONVERTED_TO_BOOKING
```

Rules:

- accept/skip/expire operations must be idempotent
- expiration should be handled by a scheduled job or event-driven worker
- accepting an offer must still respect inventory consistency

---

# 11. Current API Roadmap

## Authentication

Implemented:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

Planned:

```http
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

---

## Event APIs

Implemented/substantially implemented:

```http
POST  /api/v1/events
GET   /api/v1/events
GET   /api/v1/events/public/{eventId}
GET   /api/v1/events/{eventId}
PATCH /api/v1/events/{eventId}
```

Also implemented:

- publish
- cancel
- pagination
- search/filter
- anonymous published-event detail
- automatic completion

Current public browsing rule:

- `GET /api/v1/events/public/{eventId}` returns only `PUBLISHED` events.
- Draft/missing events return `EVENT_NOT_FOUND` to avoid leaking private event existence.
- Booking still requires login.

---

## TicketType APIs

```http
POST   /api/v1/events/{eventId}/ticket-types
GET    /api/v1/events/{eventId}/ticket-types
GET    /api/v1/events/ticket-types/{ticketTypeId}
PATCH  /api/v1/events/ticket-types/{ticketTypeId}
DELETE /api/v1/events/ticket-types/{ticketTypeId}
```

Current status:

```text
Create        DONE
Get list      DONE
Get detail    DONE
Update        DONE
Delete        DONE
Testing       DONE
```

---

## Booking APIs

Implemented/substantially implemented:

```http
POST  /api/v1/bookings
GET   /api/v1/bookings
GET   /api/v1/bookings/{bookingId}
PATCH /api/v1/bookings/{bookingId}/cancel
```

Current status:

```text
Booking entity          DONE
BookingItem entity      DONE
Create booking          DONE
Get my bookings         DONE
Get booking detail      DONE
Cancel pending booking  DONE
Ownership checks        DONE
Basic availability      DONE
Inventory decision      DONE
Safety contract test    DONE
Inventory reservation   DEFERRED
Payment confirmation    DEFERRED
Concurrency locking     DEFERRED
```

Current rule:

- Only `CUSTOMER` can use customer booking APIs.
- Booking can contain multiple ticket types, but all items must belong to the same `PUBLISHED` event.
- `BookingItem.unitPrice` and `BookingItem.subtotal` preserve purchase-time pricing.
- Phase 5 basic booking validates available quantity using `quantity - soldQuantity`.
- Phase 5 basic booking does not reserve inventory or increment `soldQuantity` yet. That must be handled with Payment/Concurrency design.
- Inventory boundary decision is recorded in `docs/decisions/ADR-002-booking-inventory-reservation.md`.

---

## EventMatch APIs

Status: **PLANNED**

```http
POST /api/v1/event-match
```

Purpose:

```text
Convert a buyer's natural-language intent into structured preferences,
then return real, eligible events ranked by backend logic.
```

Important:

- EventMatch should only return `PUBLISHED` events.
- Results must come from the database.
- AI output must be validated before it affects search/ranking.
- Normal search/filter must remain available as fallback.

---

## Waitlist APIs

Status: **PLANNED AFTER BOOKING/PAYMENT**

```http
POST /api/v1/ticket-types/{ticketTypeId}/waitlist
GET  /api/v1/me/waitlist
POST /api/v1/waitlist-offers/{offerId}/accept
POST /api/v1/waitlist-offers/{offerId}/skip
```

Purpose:

```text
Let customers join a fair queue for sold-out ticket types and receive
time-limited reservation offers when inventory returns.
```

Important:

- waitlist operations must be customer-owned
- duplicate active entries must be rejected or treated idempotently
- offer accept/skip/expire must be idempotent
- accepting an offer must reuse booking/inventory consistency rules

---

# 12. TicketType Business Rules

## Create

1. Event must exist.
2. User must be `ADMIN` or `ORGANIZER`.
3. Organizer must own the Event.
4. Event must be `DRAFT`.
5. TicketType name must not duplicate within the same Event.
6. `soldQuantity` starts at `0`.
7. Client cannot control `soldQuantity`.

## Update

1. TicketType must exist.
2. Get Event through `ticketType.getEvent()`.
3. User must be authorized.
4. Organizer must own Event.
5. Event must be `DRAFT`.
6. If name changes, check duplicate name.
7. PATCH semantics: omitted fields remain unchanged.
8. Null request properties must not overwrite existing values.
9. Quantity must not be lower than current `soldQuantity`.

## Delete

Implemented:

1. TicketType must exist.
2. User must be authorized.
3. Organizer must own Event.
4. Event must be `DRAFT`.
5. Deletion is allowed only when `soldQuantity = 0`.

---

# 13. DTO and Mapper Pattern

The project separates API models from JPA entities.

Create:

```text
CreateTicketTypeRequest
        |
     MapStruct
        v
    TicketType
```

Response:

```text
TicketType
    |
 MapStruct
    v
TicketTypeResponse
```

Business-controlled fields are set in the Service.

Example:

```java
result.setEvent(event);
result.setSoldQuantity(0);
```

Mapper handles data conversion, not authorization or business decisions.

---

# 14. PATCH Mapping

TicketType update is partial.

MapStruct should use:

```java
@BeanMapping(
    nullValuePropertyMappingStrategy =
        NullValuePropertyMappingStrategy.IGNORE
)
```

Example:

Existing:

```text
name        = VIP
description = Front seats
price       = 500000
quantity    = 100
```

Request:

```json
{
  "name": "VIP Premium",
  "price": 600000
}
```

Result:

```text
name        = VIP Premium
description = Front seats
price       = 600000
quantity    = 100
```

---

# 15. Stream API Already Used

Example:

```java
return ticketTypes.stream()
        .map(ticketTypeMapper::toTicketTypeResponse)
        .toList();
```

Meaning:

```text
List<TicketType>
    -> stream()
    -> transform every TicketType
    -> TicketTypeResponse
    -> toList()
    -> List<TicketTypeResponse>
```

Duplicate checking currently uses:

```java
boolean exist = ticketTypes.stream()
        .anyMatch(ticketType ->
            ticketType.getName()
                .equalsIgnoreCase(request.getName()));
```

Possible future optimization:

```java
existsByEventIdAndNameIgnoreCase(...)
```

and a database unique constraint for stronger concurrency safety.

---

# 16. Development Phases

## Phase 1 — Authentication & Security

Status: **DONE / substantially implemented**

```text
Register
  -> password hashing
  -> persist User

Login
  -> verify credentials
  -> generate JWT

Request
  -> JWT Filter
  -> Authentication
  -> Authorization
```

Implemented concepts:

- register
- login
- password hashing
- JWT
- JWT filter
- SecurityContext
- Authentication/principal
- roles
- 401/403
- method security foundation

Remaining security hardening:

- Refresh Token
- refresh-token rotation
- refresh-token revocation
- logout
- security hardening

---

## Phase 2 — User / Current User

Status: **DONE / substantially implemented**

Implemented concepts:

- current user ID
- current user role
- ownership checks
- role-based access

---

## Phase 3 — Event Management

Status: **DONE / substantially implemented**

```text
Create Event              DONE
Get Event Detail          DONE
Get Event List            DONE
Pagination                DONE
Search / Filter           DONE
Update Event              DONE
Publish Event             DONE
Cancel Event              DONE
Auto-complete Scheduler   DONE
Ownership Authorization   DONE
```

Deferred:

```text
Admin approval workflow         -> TODO / needs final status design
```

Public published-event browsing is implemented through `GET /api/v1/events/public/{eventId}`.

---

## Phase 4 — Ticket Management

Status: **DONE / substantially implemented**

```text
TicketType Entity       DONE
Repository              DONE
Create DTO              DONE
Response DTO            DONE
Mapper                  DONE

Create TicketType       DONE
Get TicketTypes         DONE
Get TicketType Detail   DONE
Update TicketType       DONE
Delete TicketType       DONE
Full testing            DONE
```

Phase 4 is complete. Booking can now build on stable Event and TicketType rules.

---

# 17. Phase 5 — Booking

Status: **IN PROGRESS / PR1-PR4 implemented**

Implemented entities:

```text
Booking
BookingItem
```

Target flow:

```text
Customer
   |
Published Event
   |
Choose TicketType
   |
Choose quantity
   |
Create Booking
   |
Validate availability
   |
Calculate total
   |
Payment
```

Implemented in current phase:

```text
Booking / BookingItem entities
Create Booking
Get current customer's bookings
Get booking detail with ownership check
Cancel PENDING_PAYMENT booking
Basic availability validation
Purchase-time unit price preservation
Inventory reservation decision ADR
Safety contract test for soldQuantity
```

Deferred to later Booking/Payment/Concurrency work:

```text
Reserve inventory
Confirm payment
Increment soldQuantity
Expire pending bookings
Concurrency locking / idempotency
```

Important topics:

- transactions
- inventory consistency
- race conditions
- concurrency
- locking
- isolation
- idempotency
- booking state machine

This is one of the most important CV/interview phases.

---

# 18. Phase 6 — Payment

Status: **NOT IMPLEMENTED**

Planned:

- Payment entity
- payment status
- QR payment
- payment creation
- callback/webhook
- payment verification
- idempotency
- timeout/expiration
- booking confirmation

---

# 19. Phase 7 — Ticket + QR

Status: **NOT IMPLEMENTED**

Flow:

```text
Payment SUCCESS
      |
Booking CONFIRMED
      |
Generate Ticket
      |
Generate QR
      |
Customer receives ticket
```

Planned:

- Ticket entity
- unique ticket code
- QR generation
- ticket status
- check-in
- duplicate check-in prevention

---

# 20. Phase 8 — Smart Waitlist

Status: **NOT IMPLEMENTED**

Smart Waitlist should be implemented after Booking, Payment, and Ticket inventory rules are stable.

Target:

```text
TicketType sold out
      |
Customer joins waitlist
      |
Inventory returns
      |
Create time-limited offer
      |
Customer accepts
      |
Continue Booking/Payment
```

Planned:

- WaitlistEntry entity
- WaitlistOffer entity
- duplicate active-entry prevention
- fair queue ordering
- offer expiration
- idempotent accept/skip/expire
- integration with booking inventory rules
- notification event when an offer is created

This phase is valuable for backend interviews because it combines transactions, scheduling, idempotency, fairness, and event-driven thinking.

---

# 21. Phase 9 — Notification / Kafka

Status: **NOT IMPLEMENTED**

Target:

```text
Booking CONFIRMED
      |
Publish event
      |
Kafka
      |
Notification consumer
      |
Email
```

Potential notifications:

- booking confirmation
- payment success
- ticket delivery
- waitlist offer created
- event reminder
- cancellation

Kafka should only be introduced where it has a real business/architecture reason.

---

# 22. Phase 10 — Admin Management

Status: **NOT FULLY IMPLEMENTED**

Planned:

- user management
- organizer management
- event moderation
- event approval/rejection
- booking management
- payment management
- statistics/revenue

Original business requirement:

```text
Organizer creates Event
        |
Admin reviews
        |
Approve / Reject
        |
Published
```

Important current mismatch:

`EventStatus` currently contains only:

```text
DRAFT
PUBLISHED
CANCELLED
COMPLETED
```

If admin approval remains mandatory, an approval state or separate approval model must be designed. Do not silently add a status without reviewing the domain.

---

# 23. Phase 11 — AI / EventMatch

Status: **NOT IMPLEMENTED**

Main feature:

```text
EventMatch for attendees
```

Customer gives natural-language intent.

AI extracts structured preferences:

- topic/category
- location
- date range
- budget
- audience level
- goal/format

Backend then:

- validates AI output
- filters real published events
- checks availability/price constraints
- ranks matches deterministically
- returns match reasons

Secondary feature:

```text
AI Event Assistant for Organizers
```

Organizer gives rough information and AI suggests title, description, tags, target audience, ticket types, pricing, and marketing content.

EventMatch is the priority AI direction because it directly improves buyer discovery.

---

# 24. Phase 12 — Redis / Docker / CI/CD

Status: **NOT FULLY IMPLEMENTED**

Potential Redis use:

- event caching
- rate limiting
- distributed locking
- token blacklist
- high-frequency availability data

Infrastructure target:

```text
Spring Boot
   |
Docker
   +-- Database
   +-- Redis
   +-- Kafka
```

CI/CD:

```text
Git push
  -> CI
  -> test
  -> build
  -> Docker image
  -> deploy
```

---

# 25. Security Roadmap

Current:

```text
JWT
Spring Security
Roles
Ownership
401 / 403
SecurityContext
```

Remaining:

```text
Refresh Token
Refresh Token Rotation
Refresh Token Revocation
Logout
Rate Limiting
Token Blacklist if needed
General Security Hardening
```

AI must not remove security checks just to make an endpoint easier to test.

---

# 26. CV Positioning

Do NOT describe the project simply as:

> A website for selling event tickets.

That sounds like a basic CRUD project.

Preferred positioning:

> **EventHub — Event Ticketing & Booking Platform**
>
> Backend-focused event ticketing platform built with Java Spring Boot, featuring JWT authentication/authorization, organizer resource ownership, event lifecycle management, ticket inventory, transactional booking, concurrency-safe inventory handling, payment/webhook processing, QR ticketing, smart waitlist for sold-out ticket demand, Kafka-based notifications, Redis optimization, and AI-powered buyer-side event matching.

Only put features on the final CV that are actually implemented.

Strong CV/interview keywords, when implemented:

- Java
- Spring Boot
- Spring Security
- JWT
- JPA/Hibernate
- RBAC
- resource ownership authorization
- transaction management
- concurrency control
- inventory consistency
- idempotency
- payment webhook
- QR ticket
- smart waitlist
- Kafka
- Redis
- Docker
- CI/CD
- AI-powered event matching
- structured AI output validation

---

# 27. Why It Is Impressive in an Interview

The project should allow discussion of:

## Security

- Why JWT?
- How does the JWT filter work?
- Authentication vs authorization?
- 401 vs 403?
- How is Organizer ownership enforced?
- How should banned/locked users be handled?

## JPA

- Why `ManyToOne` on TicketType?
- What is the owning side?
- Why `mappedBy`?
- Why not store availableQuantity?
- What is dirty checking?

## Transactions

- Where should `@Transactional` live?
- What happens on rollback?
- Why does a transaction alone not automatically solve inventory races?

## Booking

- What if two customers buy the last ticket?
- Optimistic vs pessimistic locking?
- How to prevent overselling?
- What if a payment callback arrives twice?
- What does idempotency mean?

## Distributed systems

- Why Kafka?
- Why Redis?
- What happens if a Kafka consumer fails?
- What if payment succeeds but notification fails?

## Smart Waitlist

- How do you prevent duplicate waitlist entries?
- How do you choose the next eligible buyer fairly?
- What happens if a waitlist offer expires?
- Why must accept/skip/expire be idempotent?
- How does waitlist reuse booking inventory rules?

## AI / EventMatch

- Why not build a generic chatbot?
- How do you prevent AI from inventing events?
- What does the AI extract, and what does the backend decide?
- How do you fallback when the AI provider fails?
- What event metadata is required for useful matching?

## Architecture

- Why DTO instead of returning Entity?
- Why Service layer?
- Why MapStruct?
- Where should business rules live?

---

# 28. AI Coding Rules

Any AI assistant working on EventHub MUST:

## Rule 1 — Read this document first

Understand:

- current architecture
- current entities
- current conventions
- current phase
- existing security
- DTO/mapper patterns
- exception handling

## Rule 2 — Do not invent implementation status

For example:

```text
Redis planned != Redis implemented
Kafka planned != Kafka implemented
Payment planned != Payment implemented
```

## Rule 3 — Minimal safe changes

Use:

```text
Analyze
  -> Plan
  -> Minimal change
  -> Compile
  -> Test
  -> Explain
```

Do not rewrite unrelated files.

## Rule 4 — Preserve conventions

Use existing:

- `ApiResponse<T>`
- `AppException`
- `ErrorCode`
- DTOs
- MapStruct
- Lombok
- Controller/Service/Repository structure
- Security conventions

Do not introduce another response/error architecture without a clear reason.

## Rule 5 — Business logic belongs in the appropriate layer

Controller:

```text
receive request
  -> validation
  -> call Service
  -> return response
```

Service/domain layer:

```text
authorization
ownership
state rules
inventory
booking
payment
business decisions
```

## Rule 6 — Explain before major implementation

For difficult features such as Booking, Payment, Concurrency, Kafka, Redis and AI:

1. Explain the business problem.
2. Explain the architecture.
3. Explain trade-offs.
4. Then implement.

## Rule 7 — Never silently change domain decisions

If implementation requires changing:

- entity relationships
- status values
- booking behavior
- payment behavior
- security rules
- API contracts

explain the trade-off before making a major change.

---

# 29. Immediate Next Steps

```text
CURRENT
   |
Design Booking ERD in detail
   |
Booking + BookingItem
   |
Inventory / Transaction / Concurrency
   |
Payment
   |
Ticket + QR
   |
Smart Waitlist
   |
Kafka / Notification
   |
Admin
   |
Event metadata for matching
   |
AI / EventMatch
   |
Redis / Docker / CI/CD / Deployment
```

**Current priority is to design and implement Booking cleanly on top of the completed Event and TicketType foundations.**

Booking is the point where EventHub should demonstrate the strongest backend engineering ability: transaction management, inventory consistency, concurrency, locking, and idempotency.

EventMatch should be implemented after the Event model has enough structured discovery metadata.
Smart Waitlist should be implemented after Booking/Payment can safely reserve and release inventory.
