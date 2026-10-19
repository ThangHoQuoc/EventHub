import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { formatCurrency } from "../../utils/format";
import { LineIcon } from "../ui/LineIcon";
import { DateBadge, SaveButton, StatusBadge } from "./EventCardParts";
import { EventPoster } from "./EventPoster";

type EventCardProps = {
  event: Event;
  variant?: "featured" | "compact" | "match";
};

export function EventCard({ event, variant = "featured" }: EventCardProps) {
  return (
    <article className={`ev-event-card ev-event-card--${variant}`}>
      <div className="ev-event-card-poster">
        <EventPoster event={event} />
        <DateBadge date={event.startAt} />
        <SaveButton event={event} />
      </div>
      <div className="ev-event-card-body">
        <div className="ev-event-card-topline">
          <span>{event.category}</span>
          {event.matchScore ? <small>{event.matchScore}% phù hợp</small> : null}
        </div>
        <h3>{event.title}</h3>
        <p><LineIcon name="map-pin" />{event.location}</p>
        <p><LineIcon name="clock" />{new Date(event.startAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
        {variant === "match" && event.matchReason ? <small>{event.matchReason}</small> : null}
        <div className="ev-event-card-footer">
          <strong>{event.minPrice === 0 ? "Miễn phí" : `Từ ${formatCurrency(event.minPrice)}`}</strong>
          <StatusBadge status={event.ticketAvailability} />
        </div>
        <Link className="ev-event-card-link" to={`/events/${event.id}`} aria-label={`Xem chi tiết ${event.title}`} />
      </div>
    </article>
  );
}
