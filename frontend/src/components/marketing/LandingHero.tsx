import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Event } from "../../types/event";
import { EventSearchBar } from "../event/EventSearchBar";
import { EventPoster } from "../event/EventPoster";
import { LineIcon } from "../ui/LineIcon";

const quickTopics = ["Âm nhạc", "Workshop", "Công nghệ", "Nghệ thuật", "Cuối tuần"];

export function LandingHero({ event }: { event?: Event }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  function search() {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    navigate(`/explore${params.size ? `?${params}` : ""}`);
  }

  return (
    <section className="ev-home-hero">
      <div className="ev-home-hero-copy">
        <span className="ev-eyebrow"><LineIcon name="sparkles" />Khám phá sự kiện tại Việt Nam</span>
        <h1>Cuối tuần này,<br />bạn muốn đi đâu?</h1>
        <p>Khám phá các sự kiện mới được công bố và chọn vé phù hợp với bạn.</p>
        <EventSearchBar city={city} date={date} onChange={setQuery} onCityChange={setCity} onDateChange={setDate} onSubmit={search} value={query} />
        <div className="ev-quick-topics" aria-label="Chủ đề phổ biến">
          <span>Thử nhanh:</span>
          {quickTopics.map((topic) => <Link key={topic} to={`/explore?filter=${encodeURIComponent(topic)}`}>{topic}</Link>)}
        </div>
      </div>

      {event && <div className="ev-home-hero-visual" aria-label="Sự kiện mới công bố">
        <article className="ev-hero-event-card">
          <EventPoster event={event} variant="hero" />
          <div className="ev-hero-event-info">
            <div><small>{event.category}</small><h2>{event.title}</h2></div>
            <p><LineIcon name="map-pin" />{event.location}</p>
            <Link to={`/events/${event.id}`}>Xem sự kiện và giá vé</Link>
          </div>
        </article>
      </div>}
    </section>
  );
}
