import type { Event } from "../../types/event";
import { EventCard } from "../event/EventCard";
import { SectionHeader } from "./SectionHeader";

export function FeaturedEditorial({ events }: { events: Event[] }) {
  return (
    <section className="ev-home-section ev-featured-section">
      <SectionHeader
        action={{ label: "Xem tất cả", to: "/explore" }}
        eyebrow="Nhịp sống thành phố"
        title="Đang được quan tâm"
      />
      <div className="ev-featured-editorial">
        {events.slice(0, 5).map((event) => <EventCard event={event} key={event.id} />)}
      </div>
    </section>
  );
}
