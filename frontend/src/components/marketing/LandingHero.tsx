import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Event } from "../../types/event";
import { EventSearchBar } from "../event/EventSearchBar";
import { EventPoster } from "../event/EventPoster";
import { MatchScoreRing, TicketCard } from "../auth/AuthVisualPrimitives";
import { LineIcon } from "../ui/LineIcon";

const quickTopics = ["Âm nhạc", "Workshop", "Công nghệ", "Nghệ thuật", "Cuối tuần"];

export function LandingHero({ event }: { event: Event }) {
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
        <p>Tìm sự kiện hợp gu, nhận gợi ý từ EventMatch và giữ chỗ chỉ trong vài bước.</p>
        <EventSearchBar city={city} date={date} onChange={setQuery} onCityChange={setCity} onDateChange={setDate} onSubmit={search} value={query} />
        <div className="ev-quick-topics" aria-label="Chủ đề phổ biến">
          <span>Thử nhanh:</span>
          {quickTopics.map((topic) => <Link key={topic} to={`/explore?filter=${encodeURIComponent(topic)}`}>{topic}</Link>)}
        </div>
      </div>

      <div className="ev-home-hero-visual" aria-label="Sự kiện nổi bật được EventMatch gợi ý">
        <TicketCard />
        <article className="ev-hero-event-card">
          <EventPoster event={event} variant="hero" />
          <div className="ev-hero-event-info">
            <div><small>EVENTMATCH GỢI Ý</small><h2>Saigon Tech Meetup 2025</h2></div>
            <MatchScoreRing score={94} />
            <p><LineIcon name="map-pin" />GEM Center, TP.HCM</p>
            <strong>Từ 150.000đ</strong>
          </div>
        </article>
        <span className="ev-floating-chip ev-floating-chip--stock"><i />Còn 12 vé</span>
        <span className="ev-floating-chip ev-floating-chip--trend"><LineIcon name="trending" />Đang được quan tâm</span>
      </div>
    </section>
  );
}
