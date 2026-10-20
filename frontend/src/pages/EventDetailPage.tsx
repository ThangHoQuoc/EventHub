import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingStickyCard } from "../components/event/BookingStickyCard";
import { EventPoster } from "../components/event/EventPoster";
import { RequestState } from "../components/ui/RequestState";
import { getEventTicketTypes, getPublicEventById, mapDtoToEvent } from "../api/events";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";
import type { Event } from "../types/event";
import type { TicketType } from "../types/ticket";

export function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setEvent(null); setError(""); setLoading(true);
    getPublicEventById(id!).then(dto => { if (active) setEvent(mapDtoToEvent(dto)); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retry]);

  useEffect(() => {
    let active = true;
    setTicketTypes([]); setTicketError("");
    if (user) getEventTicketTypes(id!).then(types => {
      if (active) setTicketTypes(types.map(t => {
        const availableQuantity = Math.max(0, t.quantity - t.soldQuantity);
        return { ...t, description: t.description ?? "", availableQuantity,
          status: availableQuantity === 0 ? "SOLD_OUT" : availableQuantity < 10 ? "LOW_STOCK" : "AVAILABLE" };
      }));
    }).catch(err => { if (active) setTicketError(err.message); });
    return () => { active = false; };
  }, [id, user, retry]);

  return <div className="ev-editorial-page ev-detail-page">
    <RequestState loading={loading} error={error} onRetry={() => setRetry(n => n + 1)} />
    {event && <>
      <section className="ev-detail-hero"><div className="ev-detail-hero-inner">
        <nav className="ev-detail-breadcrumb" aria-label="Breadcrumb"><Link to="/explore">Khám phá</Link><span>/</span><strong>{event.category}</strong></nav>
        <div className="ev-detail-hero-grid"><div className="ev-detail-hero-copy">
          <span className="ev-eyebrow">{event.category}</span><h1>{event.title}</h1><p>{event.description}</p>
          <div className="ev-detail-meta"><span>{formatDate(event.startAt)}</span><span>{event.location}</span></div>
        </div><div className="ev-detail-hero-poster"><EventPoster event={event} variant="hero" /></div></div>
      </div></section>
      <section className="ev-detail-layout"><div className="ev-detail-content">
        <div className="ev-detail-block"><h2>Về sự kiện</h2><p style={{ whiteSpace: "pre-wrap" }}>{event.description || "Ban tổ chức chưa cung cấp mô tả."}</p></div>
        <div className="ev-detail-block"><h2>Thời gian và địa điểm</h2><p>{formatDate(event.startAt)} – {formatDate(event.endAt)}</p><p>{event.location}</p></div>
      </div>
      {!user ? <aside className="booking-card"><h2>Chọn vé</h2><p>Đăng nhập để xem loại vé và số lượng còn lại.</p><Link className="btn btn-primary" to={`/login?redirect=${encodeURIComponent(`/events/${id}`)}`}>Đăng nhập</Link></aside>
        : ticketError ? <RequestState error={ticketError} onRetry={() => setRetry(n => n + 1)} />
        : ticketTypes.length ? <BookingStickyCard key={id} event={event} ticketTypes={ticketTypes} />
        : <aside className="booking-card"><p role="status">Chưa có loại vé để đặt.</p></aside>}
      </section>
    </>}
  </div>;
}
