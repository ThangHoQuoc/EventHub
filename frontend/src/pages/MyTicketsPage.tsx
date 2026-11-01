import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { QRCode } from "../components/ui/QRCode";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { getMyTicketsApi, type TicketStatus } from "../api/tickets";
import { useApiResource } from "../hooks/useApiResource";
import { formatDateTime } from "../utils/format";

export const ticketStatusLabel: Record<TicketStatus, string> = {
  VALID: "Có hiệu lực",
  USED: "Đã check-in",
  CANCELLED: "Đã hủy",
};

export function MyTicketsPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"ALL" | TicketStatus>("ALL");
  const resource = useApiResource(() => getMyTicketsApi({ page, size: 10 }), [page]);

  const allTickets = resource.data?.content ?? [];
  const validCount = allTickets.filter((t) => t.status === "VALID").length;
  const usedCount = allTickets.filter((t) => t.status === "USED").length;

  const visible = allTickets.filter(
    (ticket) => filter === "ALL" || ticket.status === filter
  );

  return (
    <CustomerLayout
      activeNav="tickets"
      description="Quản lý toàn bộ vé tham dự sự kiện của bạn. Mỗi vé đi kèm một mã QR duy nhất để check-in tại cổng."
      title="Vé điện tử của tôi"
    >
      <div className="ev-my-tickets-wrap">
        {/* Bộ lọc tab trạng thái vé */}
        <div className="ev-tickets-filter-bar">
          <div className="ev-tickets-tab-group">
            <button
              className={`ev-ticket-tab-btn ${filter === "ALL" ? "is-active" : ""}`}
              onClick={() => setFilter("ALL")}
              type="button"
            >
              <span>Tất cả</span>
              <span className="count-pill">{allTickets.length}</span>
            </button>
            <button
              className={`ev-ticket-tab-btn ${filter === "VALID" ? "is-active" : ""}`}
              onClick={() => setFilter("VALID")}
              type="button"
            >
              <span>Có hiệu lực</span>
              <span className="count-pill">{validCount}</span>
            </button>
            <button
              className={`ev-ticket-tab-btn ${filter === "USED" ? "is-active" : ""}`}
              onClick={() => setFilter("USED")}
              type="button"
            >
              <span>Đã check-in</span>
              <span className="count-pill">{usedCount}</span>
            </button>
          </div>

          <button
            className="ev-ticket-refresh-btn"
            disabled={resource.loading}
            onClick={resource.reload}
            type="button"
          >
            <LineIcon name="refresh" />
            <span>Làm mới</span>
          </button>
        </div>

        <RequestState
          error={resource.error}
          loading={resource.loading}
          onRetry={resource.reload}
        />

        {/* Lưới danh sách thẻ vé điện tử */}
        {visible.length > 0 ? (
          <div className="ev-ticket-cards-list">
            {visible.map((ticket) => {
              const isValid = ticket.status === "VALID";
              return (
                <article
                  key={ticket.id}
                  className={`ev-ticket-item-pass ${isValid ? "is-valid" : "is-used"}`}
                >
                  {/* Thân vé bên trái */}
                  <div className="ev-ticket-pass-main">
                    <div className="ev-pass-topline">
                      <span className="ev-pass-type-badge">
                        {ticket.ticketTypeName}
                      </span>
                      <span
                        className={`ev-pass-status-badge ${
                          isValid ? "status-valid" : "status-used"
                        }`}
                      >
                        <LineIcon name={isValid ? "check" : "clock"} />
                        <span>{ticketStatusLabel[ticket.status] || ticket.status}</span>
                      </span>
                    </div>

                    <h3 className="ev-pass-title">{ticket.eventTitle}</h3>

                    <div className="ev-pass-meta-row">
                      <span className="meta-cell">
                        <LineIcon name="calendar" />
                        <span>Cấp lúc: {formatDateTime(ticket.issuedAt)}</span>
                      </span>
                      {ticket.checkedInAt && (
                        <span className="meta-cell checked-in">
                          <LineIcon name="check" />
                          <span>Check-in: {formatDateTime(ticket.checkedInAt)}</span>
                        </span>
                      )}
                      <span className="meta-cell">
                        <LineIcon name="ticket" />
                        <span>
                          Đơn: <code className="mono">{ticket.bookingId.slice(0, 8)}</code>
                        </span>
                      </span>
                    </div>

                    <div className="ev-pass-actions">
                      <Link
                        className="ev-open-qr-btn"
                        to={`/my-tickets/${ticket.id}`}
                      >
                        <span>Mở mã vé &amp; QR toàn màn hình</span>
                        <LineIcon name="arrow-right" />
                      </Link>
                      <Link
                        className="ev-view-event-link"
                        to={`/events/${ticket.eventId}`}
                      >
                        <span>Xem sự kiện</span>
                        <LineIcon name="arrow-right" />
                      </Link>
                    </div>
                  </div>

                  {/* Rãnh khuyết xé cuống vé */}
                  <div className="ev-pass-perforation">
                    <span className="pass-notch top" />
                    <div className="pass-dashed-line" />
                    <span className="pass-notch bottom" />
                  </div>

                  {/* Cuống vé chứa mã QR bên phải */}
                  <div className="ev-ticket-pass-stub">
                    <div className="ev-stub-qr-box">
                      <QRCode
                        label={`Mã QR vé ${ticket.ticketCode}`}
                        value={ticket.qrPayload}
                      />
                    </div>
                    <small className="ev-stub-label">MÃ CHECK-IN</small>
                    <strong className="ev-stub-code">{ticket.ticketCode}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          resource.data && (
            <EmptyState
              actionLabel="Khám phá sự kiện ngay"
              actionTo="/explore"
              description="Bạn chưa có vé nào trong nhóm này. Hãy tìm kiếm sự kiện yêu thích và giữ chỗ ngay hôm nay."
              title="Chưa có vé tham dự"
            />
          )
        )}

        <PageNav
          disabled={resource.loading}
          onChange={setPage}
          page={page}
          totalPages={resource.data?.totalPages ?? 0}
        />

        <div className="ev-bottom-link-row">
          <Link className="ev-text-link" to="/my-bookings">
            <span>Xem lịch sử đơn đặt vé tại mục Đơn hàng</span>
            <LineIcon name="arrow-right" />
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
