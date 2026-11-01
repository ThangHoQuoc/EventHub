import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingStickyCard } from "../components/event/BookingStickyCard";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getEventTicketTypes, getPublicEventById, mapDtoToEvent } from "../api/events";
import { useAuth } from "../context/AuthContext";
import { formatDateTime, formatCurrency } from "../utils/format";
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
  const [ticketLoading, setTicketLoading] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setEvent(null);
    setError("");
    setLoading(true);

    getPublicEventById(id!)
      .then((dto) => {
        if (active) setEvent(mapDtoToEvent(dto));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, retry]);

  useEffect(() => {
    let active = true;
    setTicketTypes([]);
    setTicketError("");
    setTicketLoading(!!user);

    if (user) {
      getEventTicketTypes(id!)
        .then((types) => {
          if (active) {
            setTicketTypes(
              types.map((t) => {
                const availableQuantity = Math.max(0, t.quantity - t.soldQuantity);
                return {
                  ...t,
                  description: t.description ?? "",
                  availableQuantity,
                  status:
                    availableQuantity === 0
                      ? "SOLD_OUT"
                      : availableQuantity < 10
                      ? "LOW_STOCK"
                      : "AVAILABLE",
                };
              })
            );
          }
        })
        .catch((err) => {
          if (active) setTicketError(err.message);
        })
        .finally(() => {
          if (active) setTicketLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [id, user, retry]);

  return (
    <div className="ev-editorial-page ev-detail-page">
      <RequestState loading={loading} error={error} onRetry={() => setRetry((n) => n + 1)} />

      {event && (
        <>
          {/* 1. Hero Section cuốn hút */}
          <section className="ev-detail-hero">
            <div className="ev-detail-hero-inner">
              <nav className="ev-detail-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <Link to="/explore">Khám phá</Link>
                <span>/</span>
                <strong>{event.category || "Sự kiện"}</strong>
              </nav>

              <div className="ev-detail-hero-grid">
                <div className="ev-detail-hero-copy">
                  <div className="ev-detail-badge-row">
                    <span className="ev-detail-category-badge">{event.category}</span>
                    {event.city && (
                      <span className="ev-detail-city-badge">
                        <LineIcon name="map-pin" />
                        <span>{event.city}</span>
                      </span>
                    )}
                  </div>

                  <h1>{event.title}</h1>

                  {/* Quick Meta Info Box */}
                  <div className="ev-detail-quick-meta">
                    <div className="ev-quick-meta-item">
                      <div className="ev-meta-icon">
                        <LineIcon name="calendar" />
                      </div>
                      <div className="ev-meta-text">
                        <span>Thời gian tổ chức</span>
                        <strong>{formatDateTime(event.startAt)}</strong>
                      </div>
                    </div>

                    <div className="ev-quick-meta-item">
                      <div className="ev-meta-icon">
                        <LineIcon name="map-pin" />
                      </div>
                      <div className="ev-meta-text">
                        <span>Địa điểm</span>
                        <strong>{event.location}</strong>
                      </div>
                    </div>

                    <div className="ev-quick-meta-item">
                      <div className="ev-meta-icon">
                        <LineIcon name="ticket" />
                      </div>
                      <div className="ev-meta-text">
                        <span>Giá vé tham khảo</span>
                        <strong>
                          {event.priceKnown === false
                            ? "Xem bảng giá vé"
                            : event.minPrice === 0
                            ? "Miễn phí tham gia"
                            : `Từ ${formatCurrency(event.minPrice)}`}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Poster lớn có khung viền sang trọng */}
                <div className="ev-detail-hero-poster">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Layout Chi tiết nội dung (Trái) & Sticky Booking (Phải) */}
          <section className="ev-detail-layout">
            <div className="ev-detail-content">
              {/* Khối Giới thiệu sự kiện */}
              <div className="ev-detail-block">
                <div className="ev-block-title-row">
                  <LineIcon name="sparkles" />
                  <h2>Giới thiệu sự kiện</h2>
                </div>
                <div className="ev-block-body">
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {event.description || "Ban tổ chức đang cập nhật nội dung chi tiết cho sự kiện này."}
                  </p>
                </div>
              </div>

              {/* Khối Lịch trình & Địa điểm */}
              <div className="ev-detail-block">
                <div className="ev-block-title-row">
                  <LineIcon name="clock" />
                  <h2>Thời gian &amp; Địa điểm tổ chức</h2>
                </div>
                <div className="ev-block-body">
                  <div className="ev-info-card-grid">
                    <div className="ev-info-subcard">
                      <span>BẮT ĐẦU</span>
                      <strong>{formatDateTime(event.startAt)}</strong>
                    </div>
                    <div className="ev-info-subcard">
                      <span>KẾT THÚC DỰ KIẾN</span>
                      <strong>{formatDateTime(event.endAt)}</strong>
                    </div>
                    <div className="ev-info-subcard full-width">
                      <span>ĐỊA ĐIỂM CHÍNH THỨC</span>
                      <strong>{event.location}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khối Hướng dẫn vào cổng & Chính sách vé */}
              <div className="ev-detail-block">
                <div className="ev-block-title-row">
                  <LineIcon name="shield" />
                  <h2>Hướng dẫn check-in &amp; Quy định</h2>
                </div>
                <div className="ev-block-body">
                  <ul className="ev-detail-guidelines">
                    <li>
                      <LineIcon name="check" />
                      <span>
                        <strong>Vé điện tử QR:</strong> Sau khi thanh toán thành công, mã QR vé sẽ có sẵn trong mục "Vé của tôi" và gửi về email.
                      </span>
                    </li>
                    <li>
                      <LineIcon name="check" />
                      <span>
                        <strong>Vào cổng nhanh chóng:</strong> Xuất trình mã QR trên điện thoại tại trạm soát vé của sự kiện để quét check-in 1 chạm.
                      </span>
                    </li>
                    <li>
                      <LineIcon name="check" />
                      <span>
                        <strong>Bảo mật vé:</strong> Mỗi mã vé chỉ có hiệu lực cho một lượt vào cổng duy nhất, không chia sẻ mã QR cho người khác.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cột Phải: Khung chọn vé Sticky Card */}
            <div className="ev-detail-sidebar">
              {!user ? (
                <aside className="booking-card ev-login-prompt-card">
                  <div className="ev-prompt-icon">
                    <LineIcon name="ticket" />
                  </div>
                  <h2>Chọn loại vé</h2>
                  <p>Vui lòng đăng nhập tài khoản để xem các hạng vé còn lại và tiến hành đặt chỗ.</p>
                  <Link
                    className="ev-primary-action-btn"
                    to={`/login?redirect=${encodeURIComponent(`/events/${id}`)}`}
                  >
                    <span>Đăng nhập để đặt vé</span>
                    <LineIcon name="arrow-right" />
                  </Link>
                </aside>
              ) : ticketLoading ? (
                <RequestState loading />
              ) : ticketError ? (
                <RequestState error={ticketError} onRetry={() => setRetry((n) => n + 1)} />
              ) : ticketTypes.length ? (
                <BookingStickyCard key={id} event={event} ticketTypes={ticketTypes} />
              ) : (
                <aside className="booking-card">
                  <h2>Thông báo vé</h2>
                  <p role="status">Sự kiện này hiện chưa mở bán hạng vé nào.</p>
                </aside>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
