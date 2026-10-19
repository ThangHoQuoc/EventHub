import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingStickyCard } from "../components/event/BookingStickyCard";
import { EventGrid } from "../components/event/EventGrid";
import { EventPoster } from "../components/event/EventPoster";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { mockEvents } from "../data/mockEvents";
import { mockTicketTypes } from "../data/mockTicketTypes";
import { formatCurrency, formatDate } from "../utils/format";
import { getEventTicketTypes, getPublicEventById, mapDtoToEvent } from "../api/events";
import type { Event } from "../types/event";
import type { TicketType } from "../types/ticket";

const schedule = [
  ["09:00", "Check-in & đón tiếp"],
  ["09:30", "Backend architecture thực chiến"],
  ["11:00", "Booking & payment flow"],
  ["14:00", "Mini workshop"],
  ["16:00", "Q&A và networking"],
];

export function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(() => mockEvents.find((item) => item.id === id) ?? mockEvents[0]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(mockTicketTypes);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    // Fetch real event details
    getPublicEventById(id)
      .then(async (dto) => {
        if (!isMounted) return;
        // Fetch ticket types for this event
        const rawTypes = await getEventTicketTypes(id);
        const mappedTypes: TicketType[] = rawTypes.length > 0
          ? rawTypes.map((t) => {
              const avail = (t.quantity || 0) - (t.soldQuantity || 0);
              return {
                id: t.id,
                eventId: t.eventId,
                name: t.name,
                description: t.description || "",
                price: Number(t.price) || 0,
                quantity: t.quantity,
                soldQuantity: t.soldQuantity,
                availableQuantity: avail,
                status: avail <= 0 ? "SOLD_OUT" : avail < 10 ? "LOW_STOCK" : "AVAILABLE",
              };
            })
          : mockTicketTypes;

        if (isMounted) {
          const minP = mappedTypes.length > 0 ? Math.min(...mappedTypes.map((t) => t.price)) : 0;
          setEvent(mapDtoToEvent(dto, minP));
          setTicketTypes(mappedTypes);
        }
      })
      .catch(() => {
        // Fallback to mock
        if (isMounted) {
          const fallback = mockEvents.find((item) => item.id === id) ?? mockEvents[0];
          setEvent(fallback);
          setTicketTypes(mockTicketTypes);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const related = mockEvents.filter((item) => item.id !== event?.id).slice(0, 3);

  if (!event) {
    return <EmptyState actionLabel="Khám phá sự kiện" actionTo="/explore" description="Sự kiện này có thể đã bị xóa hoặc chưa được công bố." title="Không tìm thấy sự kiện" />;
  }

  return (
    <div className="ev-editorial-page ev-detail-page">
      {/* Hero */}
      <section className="ev-detail-hero">
        <div className="ev-detail-hero-inner">
          <nav className="ev-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/explore">Khám phá</Link>
            <span>/</span>
            <strong>{event.category}</strong>
          </nav>

          <div className="ev-detail-hero-grid">
            <div className="ev-detail-hero-copy">
              <span className="ev-eyebrow">{event.category}</span>
              <h1>{event.title}</h1>
              <p>{event.description}</p>
              <div className="ev-detail-meta">
                <span><LineIcon name="calendar" />{formatDate(event.startAt)}</span>
                <span><LineIcon name="map-pin" />{event.location}, {event.city}</span>
                <span><LineIcon name="ticket" />{event.minPrice === 0 ? "Miễn phí" : `Từ ${formatCurrency(event.minPrice)}`}</span>
              </div>
              {event.tags.length > 0 && (
                <div className="ev-detail-tags">
                  {event.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="ev-detail-hero-poster">
              {!imgError && event.imageUrl ? (
                <img
                  alt={event.title}
                  onError={() => setImgError(true)}
                  src={event.imageUrl}
                />
              ) : (
                <EventPoster event={event} variant="hero" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content + Booking */}
      <section className="ev-detail-layout">
        <div className="ev-detail-content">
          <div className="ev-detail-block">
            <h2>Về sự kiện</h2>
            <p>{event.description} Nội dung được thiết kế thực chiến, dễ theo dõi và phù hợp với người muốn hiểu cách sản phẩm event ticketing vận hành thật.</p>
          </div>

          <div className="ev-detail-block">
            <h2>Bạn sẽ nhận được gì</h2>
            <ul className="ev-detail-checklist">
              <li><LineIcon name="check" />Hiểu quy trình backend thực tế</li>
              <li><LineIcon name="check" />Thực hành thiết kế booking flow</li>
              <li><LineIcon name="check" />Networking với mentor và fresher</li>
            </ul>
          </div>

          <div className="ev-detail-block">
            <h2>Lịch trình</h2>
            <div className="ev-detail-timeline">
              {schedule.map(([time, label]) => (
                <div key={time}>
                  <time>{time}</time>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ev-detail-block ev-detail-venue">
            <h2>Địa điểm</h2>
            <p><LineIcon name="map-pin" />{event.location}, {event.city}</p>
            <Link className="ev-text-link" to="/explore">Xem bản đồ <LineIcon name="arrow-right" /></Link>
          </div>
        </div>

        <BookingStickyCard event={event} ticketTypes={mockTicketTypes} />
      </section>

      {/* Related */}
      <section className="ev-detail-related">
        <div className="ev-section-header">
          <div>
            <span className="ev-eyebrow">Gợi ý thêm</span>
            <h2>Sự kiện liên quan</h2>
          </div>
          <Link className="ev-text-link" to="/explore">Xem tất cả <LineIcon name="arrow-right" /></Link>
        </div>
        <EventGrid events={related} />
      </section>
    </div>
  );
}
