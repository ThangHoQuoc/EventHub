# ADR-001: Prioritize Buyer-Side EventMatch and Smart Waitlist

## Status

Accepted

## Date

2026-09-16

## Context

EventHub should stand out as more than a basic event ticketing CRUD project.
The project has two goals:

- provide real buyer value, especially for attendees who need help finding suitable events
- demonstrate backend depth for a Junior/Fresher Java Backend portfolio

The initial AI direction focused on an organizer assistant for event creation and marketing.
That is useful, but it is less central to the buyer experience.

The project also needs a non-AI feature that shows strong backend engineering:
transactions, idempotency, scheduling, fairness, and inventory consistency.

## Decision

EventHub will prioritize two standout directions:

1. **EventMatch**: buyer-side AI event discovery.
   A customer describes what they want in natural language.
   AI extracts structured preferences, and the backend searches, filters, validates,
   ranks, and returns real events from the database.

2. **Smart Waitlist**: sold-out ticket demand recovery.
   A customer can join a fair waitlist for a sold-out TicketType.
   When inventory becomes available, the backend creates a time-limited offer for
   the next eligible buyer.

The organizer AI assistant remains a secondary feature.

## Key Rules

- EventMatch must not be implemented as a generic chatbot.
- The LLM must not invent events.
- AI output must be validated before affecting search/ranking.
- Backend logic remains responsible for event status, inventory, price, authorization, and ranking constraints.
- Smart Waitlist should be built after Booking and Payment rules exist.
- Waitlist offer accept/skip/expire operations must be idempotent.

## Alternatives Considered

### Organizer AI Assistant First

Pros:

- Easy to demo
- Fast to build using a prompt-based AI API
- Helps organizers create better event content

Cons:

- Less direct value for ticket buyers
- Can look like a generic AI text generator
- Does not strongly differentiate the attendee experience

Decision:

Keep as a secondary feature.

### Generic AI Chatbot

Pros:

- Simple to present as an AI feature
- Broad possible use cases

Cons:

- High risk of hallucination
- Weak backend differentiation
- Hard to enforce that results are real events
- Recruiters may see it as superficial AI integration

Decision:

Reject for MVP.

### Smart Waitlist First

Pros:

- Strong backend topic
- Clear business value when events sell out

Cons:

- Depends on Booking, Payment, inventory expiration, and notification flow
- Hard to implement honestly before the core purchase lifecycle exists

Decision:

Build after Booking/Payment/Ticket lifecycle.

## Consequences

- Event needs more structured discovery metadata, such as category, tags/topics,
  audience level, target audience, format, and goal.
- EventMatch can start with SQL/JPA search and deterministic scoring before
  introducing vector search.
- Smart Waitlist adds new planned entities: `WaitlistEntry` and `WaitlistOffer`.
- The roadmap should describe EventMatch as the flagship AI feature and Smart Waitlist
  as the main backend depth feature after Booking/Payment.
