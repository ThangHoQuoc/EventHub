import type { Event } from "../../types/event";
import { EventCard } from "./EventCard";

type EventGridProps = {
  events: Event[];
  variant?: "featured" | "compact" | "match";
};

export function EventGrid({ events, variant = "featured" }: EventGridProps) {
  return (
    <div className="ev-event-grid">
      {events.map((event) => (
        <EventCard event={event} key={event.id} variant={variant} />
      ))}
    </div>
  );
}
