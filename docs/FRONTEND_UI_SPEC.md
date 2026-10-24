# EventHub Frontend UI Spec

## Objective

This spec defines how the current Pen designs should be converted into a usable frontend later.

The immediate design scope contains:

- Landing Page
- Explore Events
- Event Detail
- EventMatch
- Login
- Register

The frontend should first use mock data that matches the planned backend API shape.
After the UI is stable, API calls can replace the mock data without redesigning the pages.

Primary users:

- Vietnamese event buyers who want to discover and buy tickets.
- Vietnamese organizers who will later create and manage events.

Primary UX direction:

- Vietnamese-first content.
- Desktop-first for the current design batch.
- Premium, cinematic, clean, dark visual style.
- Easy to scan, not text-heavy.
- Buyer-side EventMatch is the standout AI experience.

## Assumptions

- The frontend will be a web app, not a native mobile app.
- React + Vite + TypeScript is the preferred frontend stack.
- React Router will manage page routes.
- Tailwind CSS or a token-based CSS layer should implement the design system.
- Mock data will be used first because several backend endpoints are still planned.
- Backend authentication currently uses JWT, so frontend auth should be designed around token-based login.
- Mobile is not part of the first conversion pass, but the code should not make future responsive work painful.

## Recommended Tech Stack

```text
React
Vite
TypeScript
React Router
Tailwind CSS
lucide-react
TanStack Query later, when connecting real APIs
```

Do not add heavy UI libraries at the beginning.
The current design has a custom premium style, so component styling should stay close to the Pen design.

## Commands

These commands apply after a real frontend app is initialized in `frontend`.

```text
Dev:     npm run dev
Build:   npm run build
Lint:    npm run lint
Preview: npm run preview
```

If TypeScript is configured separately:

```text
Typecheck: npx tsc --noEmit
```

## Project Structure

Recommended structure:

```text
frontend/
  src/
    app/
      App.tsx
      router.tsx
    assets/
    components/
      layout/
        Header.tsx
        Footer.tsx
      ui/
        Button.tsx
        Input.tsx
        Badge.tsx
        EmptyState.tsx
        LoadingSkeleton.tsx
      event/
        EventCard.tsx
        EventGrid.tsx
        EventSearchBar.tsx
        FilterSidebar.tsx
        TicketTypeCard.tsx
        BookingStickyCard.tsx
      eventmatch/
        EventMatchBox.tsx
        EventMatchUnderstanding.tsx
        MatchedEventCard.tsx
      auth/
        AuthLayout.tsx
        LoginForm.tsx
        RegisterForm.tsx
    data/
      mockEvents.ts
      mockTicketTypes.ts
    pages/
      LandingPage.tsx
      ExploreEventsPage.tsx
      EventDetailPage.tsx
      EventMatchPage.tsx
      LoginPage.tsx
      RegisterPage.tsx
    services/
      apiClient.ts
      eventApi.ts
      authApi.ts
      eventMatchApi.ts
    types/
      event.ts
      ticket.ts
      auth.ts
    styles/
      globals.css
```

## Routes

Initial routes:

```text
/                 Landing Page
/explore          Explore Events
/events/:id       Event Detail
/eventmatch       EventMatch
/login            Login
/register         Register
```

Future routes:

```text
/checkout
/payment
/my-tickets
/my-bookings
/my-waitlist
/organizer
/organizer/events
/organizer/events/new
/organizer/events/:id/edit
/organizer/events/:id/ticket-types
/admin
/admin/events/moderation
```

## Page States

### Landing Page

Required states:

- Normal

Content blocks:

- Hero
- Featured events
- EventMatch introduction
- Smart Waitlist introduction
- Organizer teaser
- Trust/backend strength
- Final CTA

Notes:

- This page should sell the product quickly.
- Do not overload it with technical language.

### Explore Events

Required states:

- Loading event list
- Event list with data
- Filter selected
- Empty results
- Error loading events

Primary UI:

- Search bar
- Quick filter chips
- Filter sidebar
- Result count
- Sort dropdown
- Event grid
- EventMatch highlight block

Filters:

- City
- Time
- Category
- Price range
- Ticket status

### Event Detail

Required states:

- Event available
- Low stock
- Sold out with waitlist available
- Loading event detail
- Event not found
- Error loading event

Primary UI:

- Cinematic event hero
- Event metadata
- Event description
- Schedule/timeline
- Venue/location card
- Sticky ticket booking card
- Related events

Ticket states:

```text
AVAILABLE
LOW_STOCK
SOLD_OUT
WAITLIST_AVAILABLE
```

CTA rules:

- If available: show `Dat ve`.
- If low stock: show `Dat ve` and low-stock badge.
- If sold out and waitlist is available: show `Tham gia danh sach cho`.
- If sold out and waitlist is not available: show disabled sold-out state.

### EventMatch

Required states:

- Empty prompt
- Prompt examples visible
- Searching/loading
- AI understood preferences
- Matched results
- No matched results
- AI unavailable fallback

Primary UI:

- Large Vietnamese prompt input
- Example chips
- Structured understanding panel
- Matched event list/cards
- Empty state

Important rule:

EventMatch should not look like a generic chatbot.
It should feel like intent input -> structured preferences -> matched real events.

### Login

Required states:

- Normal
- Validation error
- Loading
- Login failed
- Login success redirect

Inputs:

- Email
- Password
- Remember me

Actions:

- Login
- Forgot password
- Go to Register

### Register

Required states:

- Normal
- Validation error
- Loading
- Register failed
- Register success redirect

Inputs:

- Full name
- Email
- Password
- Confirm password
- Role selector
- Terms checkbox

Role options:

```text
CUSTOMER
ORGANIZER
```

Default role:

```text
CUSTOMER
```

## Component List

Core reusable components:

```text
Header
Footer
Button
Input
Badge
EventCard
SearchBar
FilterSidebar
EventMatchBox
EventMatchUnderstanding
TicketTypeCard
BookingStickyCard
AuthLayout
AuthForm
EmptyState
LoadingSkeleton
```

### Component Reuse Map

```text
Header
- Landing
- Explore Events
- Event Detail
- EventMatch
- Login
- Register

EventCard
- Landing featured events
- Explore event grid
- EventMatch matched events
- Event Detail related events

Badge
- Event category
- Ticket status
- Match score
- Role selector

Button
- All pages

Input
- Search
- EventMatch prompt
- Auth forms

EmptyState
- Explore Events
- EventMatch

LoadingSkeleton
- Explore Events
- Event Detail
- EventMatch
```

## Mock Data Shape

### Event

```ts
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketAvailability =
  | "AVAILABLE"
  | "LOW_STOCK"
  | "SOLD_OUT"
  | "WAITLIST_AVAILABLE";

export type Event = {
  id: string;
  title: string;
  description: string;
  city: "TP.HCM" | "Ha Noi" | "Da Nang" | "Can Tho";
  location: string;
  startAt: string;
  endAt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  minPrice: number;
  status: EventStatus;
  ticketAvailability: TicketAvailability;
  matchScore?: number;
  matchReason?: string;
};
```

### TicketType

```ts
export type TicketType = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  availableQuantity: number;
  status: "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT";
};
```

### EventMatch Preferences

```ts
export type EventMatchPreferences = {
  topic?: string;
  city?: string;
  dateRange?: string;
  maxBudget?: number;
  audienceLevel?: "beginner" | "intermediate" | "advanced";
  goal?: string;
};
```

### EventMatch Result

```ts
export type EventMatchResult = {
  event: Event;
  matchScore: number;
  reason: string;
};
```

### Auth

```ts
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ORGANIZER";
};
```

## API Mapping

### Landing Page

```text
GET /api/v1/events/featured
```

Fallback while backend does not support this:

```text
Use GET /api/v1/events with a featured mock slice.
```

### Explore Events

```text
GET /api/v1/events
```

Query params:

```text
keyword
location
category
startAt
endAt
minPrice
maxPrice
status
page
size
sort
```

### Event Detail

```text
GET /api/v1/events/{eventId}
GET /api/v1/events/{eventId}/ticket-types
```

### EventMatch

```text
POST /api/v1/event-match
```

Request:

```json
{
  "query": "Tim workshop cong nghe o TP.HCM cuoi tuan nay duoi 300k"
}
```

Response:

```json
{
  "query": "Tim workshop cong nghe o TP.HCM cuoi tuan nay duoi 300k",
  "preferences": {
    "topic": "Cong nghe",
    "city": "TP.HCM",
    "dateRange": "Cuoi tuan nay",
    "maxBudget": 300000
  },
  "results": [
    {
      "eventId": "event-1",
      "matchScore": 92,
      "reason": "Phu hop voi dia diem, ngan sach va muc tieu hoc backend."
    }
  ]
}
```

### Login

```text
POST /api/v1/auth/login
```

### Register

```text
POST /api/v1/auth/register
```

## Code Style

Use clear component props and keep data rendering separate from static layout.

Example:

```tsx
type EventCardProps = {
  event: Event;
  variant?: "featured" | "compact" | "match";
};

export function EventCard({ event, variant = "featured" }: EventCardProps) {
  return (
    <article>
      <img src={event.imageUrl} alt={event.title} />
      <Badge>{event.category}</Badge>
      <h3>{event.title}</h3>
      <p>{event.city} · {event.location}</p>
      <p>Tu {formatCurrency(event.minPrice)}</p>
      {variant === "match" && event.matchScore ? (
        <p>Phu hop {event.matchScore}%</p>
      ) : null}
    </article>
  );
}
```

Conventions:

- Components use PascalCase.
- Types use PascalCase.
- Functions use camelCase.
- Keep page components focused on composition.
- Keep data formatting utilities in `src/lib` or `src/utils`.
- Avoid hardcoded repeated event data inside page components.

## UI Boundaries

Always:

- Keep Vietnamese content natural and short.
- Preserve the Pen visual direction.
- Use accessible semantic HTML where possible.
- Support keyboard access for buttons, links, inputs, selects, and filters.
- Include loading and empty states for data-heavy pages.
- Keep mock data shape close to future API contracts.

Ask first:

- Adding a large UI library.
- Changing route names.
- Changing backend API contracts.
- Adding a state management library beyond React state/query tools.
- Expanding scope beyond the current design pages.

Never:

- Commit `.env` or secrets.
- Build only static screenshots with no reusable components.
- Put all pages in one large component.
- Depend on AI-generated fake events in production logic.
- Remove auth/security flows because they are inconvenient for UI testing.

## Testing Strategy

First implementation pass:

- Build check with `npm run build`.
- Manual browser check for all initial routes.
- Verify no console errors.
- Verify desktop layouts match Pen design direction.

Later implementation pass:

- Component tests for reusable components.
- Form validation tests for Login/Register.
- Integration tests for Explore filters and EventMatch result rendering.

Manual checklist:

- Header links navigate correctly.
- Explore filters change visible selected state.
- Empty states render when mock data is empty.
- Event Detail switches between booking and waitlist CTAs based on ticket availability.
- EventMatch shows structured understanding and matched results.
- Login/Register show validation errors clearly.

## Success Criteria

The frontend conversion is ready for implementation when:

- All initial routes are defined.
- All reusable components are identified.
- Every page has required UI states.
- Mock data types are agreed.
- API mapping is documented.
- The first React implementation can be built with mock data before backend integration.

## Open Questions

- Should the first frontend implementation use Tailwind CSS or plain CSS modules?
- Should auth tokens be stored in memory, localStorage, or httpOnly cookies?
- Should `EventMatch` be available to anonymous users or only logged-in users?
- Should `Explore Events` be publicly accessible without login?
- Should organizer pages be implemented immediately after these buyer-facing pages, or after checkout/payment?
