# EventHub - Product Requirements

## 1. Product Overview

EventHub is an event ticketing, discovery, and audience intelligence platform.

The platform connects event organizers with attendees.

The system allows attendees to discover, match with, and purchase event tickets,
while organizers can create events, manage ticket inventory,
check attendees in, and analyze their audience.

## 2. Target Users

### Attendee

Users who discover and purchase event tickets.

### Organizer

Event organizers who create events and sell tickets.

### Admin

Platform administrators who manage users, organizers and events.

## 3. Core Problems

### Problem 1 - Ticket purchasing

The system must prevent ticket overselling when multiple users
purchase tickets concurrently.

### Problem 2 - Event discovery fit

Attendees often do not know the exact event name they want.
They search by intent: budget, location, weekend availability,
topics, audience level, and desired experience.

The system should help buyers find events that match their real intent,
not only match exact keywords.

### Problem 3 - Sold-out demand handling

When an event or ticket type sells out, interested buyers should not
hit a dead end. The system should support a fair waitlist/reservation
flow when capacity becomes available.

### Problem 4 - Ticket lifecycle

The system must manage the complete ticket lifecycle:

Available → Reserved → Paid → Issued → Checked-in

### Problem 5 - Organizer analytics

Organizers need to understand their event performance and audience.

### Problem 6 - Audience retention

The platform should help organizers reach existing attendees
for future events.

### Problem 7 - Event intelligence

The platform should provide AI-assisted insights based on
event and audience data.

## 4. MVP Goals

The MVP should support:

- Authentication
- Event management
- Ticket management
- Ticket inventory
- Ticket reservation
- Order management
- Payment
- QR ticket
- Check-in
- Event history
- Organizer analytics
- Audience segmentation
- AI-powered EventMatch for attendee discovery
- Smart Waitlist for sold-out ticket demand
- AI Event Copilot for organizers

## 5. Flagship Differentiators

### EventMatch - buyer-side AI discovery

EventMatch helps attendees describe what they want in natural language,
then converts that intent into structured search preferences.

Example:

```text
Find me a beginner-friendly tech event in Ho Chi Minh City this weekend,
under 300k, good for networking.
```

The AI layer should extract intent such as:

```text
topic = tech
location = Ho Chi Minh City
time = this weekend
budget <= 300000
audienceLevel = beginner
goal = networking
```

The backend remains responsible for filtering, ranking, inventory checks,
and returning real events from the database.

MVP output:

- matched events
- match score
- short explanation for why each event fits
- fallback to normal search when AI is unavailable

### Smart Waitlist - sold-out ticket recovery

Smart Waitlist helps buyers join a fair queue when a ticket type is sold out.
When tickets become available because of expiration, cancellation, or added
capacity, the system offers a time-limited reservation to the next eligible
buyer.

MVP output:

- join waitlist
- queue position
- time-limited reservation offer
- idempotent accept/skip/expire flow
- notification event when an offer is created
