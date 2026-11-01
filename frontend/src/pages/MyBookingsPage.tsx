import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { EmptyState } from "../components/ui/EmptyState";
import { LineIcon } from "../components/ui/LineIcon";
import { cancelBookingApi, getMyBookingsApi, type BookingStatus } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";
import { formatCurrency, formatDateTime } from "../utils/format";

const statusConfig: Record<
  BookingStatus,
  { label: string; modifier: string; icon: "check" | "clock" | "alert" }
> = {
  CONFIRMED: {
    label: "Đã thanh toán & Có vé",
    modifier: "is-confirmed",
    icon: "check",
  },
  PENDING_PAYMENT: {
    label: "Đang giữ chỗ (Chờ thanh toán)",
    modifier: "is-pending",
    icon: "clock",
  },
  CANCELLED: {
    label: "Đã hủy đơn",
    modifier: "is-cancelled",
    icon: "alert",
  },
  EXPIRED: {
    label: "Hết hạn giữ chỗ",
    modifier: "is-expired",
    icon: "alert",
  },
};

export function MyBookingsPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"ALL" | BookingStatus>("ALL");
  const resource = useApiResource(() => getMyBookingsApi({ page, size: 10 }), [page]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const allBookings = resource.data?.content ?? [];
  const pendingCount = allBookings.filter((b) => b.status === "PENDING_PAYMENT").length;
  const confirmedCount = allBookings.filter((b) => b.status === "CONFIRMED").length;

  const visible = allBookings.filter((booking) => filter === "ALL" || booking.status === filter);

  function copyCode(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  }

  async function cancel(id: string) {
    if (busy || !window.confirm("Hủy đơn giữ chỗ này và trả vé lại hệ thống cho người khác?")) return;
    setBusy(id);
    setError("");
    try {
      const updated = await cancelBookingApi(id);
      resource.setData((current) =>
        current
          ? {
              ...current,
              content: current.content.map((item) => (item.id === id ? updated : item)),
            }
          : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy đơn.");
    } finally {
      setBusy("");
    }
  }

  return (
    <CustomerLayout
      activeNav="bookings"
      description="Quản lý lịch sử các đơn đặt vé, theo dõi thời hạn giữ chỗ tạm thời và thông tin hóa đơn thanh toán."
      title="Đơn hàng & Giữ chỗ"
    >
      <div className="eh-customer-portal">
        {/* KPI Strip */}
        <section aria-label="Thống kê đơn hàng" className="eh-bookings-summary-strip">
          <div className="eh-summary-card">
            <div className="eh-summary-icon">
              <LineIcon name="calendar" />
            </div>
            <div className="eh-summary-meta">
              <small>Tổng số đơn</small>
              <strong>{allBookings.length}</strong>
            </div>
          </div>

          <div className={`eh-summary-card ${pendingCount > 0 ? "is-pending-alert" : ""}`}>
            <div className="eh-summary-icon is-amber">
              <LineIcon name="clock" />
            </div>
            <div className="eh-summary-meta">
              <small>Chờ thanh toán</small>
              <strong style={{ color: pendingCount > 0 ? "#d97706" : "inherit" }}>{pendingCount}</strong>
            </div>
          </div>

          <div className="eh-summary-card">
            <div className="eh-summary-icon is-emerald">
              <LineIcon name="check" />
            </div>
            <div className="eh-summary-meta">
              <small>Đã xác nhận</small>
              <strong style={{ color: "#059669" }}>{confirmedCount}</strong>
            </div>
          </div>
        </section>

        {/* Cảnh báo nếu có đơn đang giữ chỗ */}
        {pendingCount > 0 && (
          <aside className="eh-bookings-alert-hold" role="alert">
            <div className="eh-alert-left">
              <LineIcon name="alert" />
              <div>
                <p>
                  Bạn có <strong>{pendingCount} đơn hàng</strong> đang trong trạng thái giữ chỗ tạm thời (tối đa 10 phút).
                </p>
                <small style={{ color: "#a16207" }}>
                  Vui lòng hoàn tất thanh toán trước khi thời hạn kết thúc để đảm bảo không bị nhả vé cho khách khác.
                </small>
              </div>
            </div>
            <button
              className="eh-filter-chip"
              onClick={() => setFilter("PENDING_PAYMENT")}
              style={{ background: "#ffffff", border: "1px solid #fde68a", color: "#b45309" }}
              type="button"
            >
              Xem ngay
            </button>
          </aside>
        )}

        {/* Thanh lọc trạng thái đơn hàng */}
        <div className="eh-filter-nav-bar">
          <div className="eh-filter-chips">
            <button
              className={`eh-filter-chip ${filter === "ALL" ? "is-active" : ""}`}
              onClick={() => setFilter("ALL")}
              type="button"
            >
              Tất cả
              <span className="eh-filter-chip-count">{allBookings.length}</span>
            </button>
            <button
              className={`eh-filter-chip ${filter === "PENDING_PAYMENT" ? "is-active" : ""}`}
              onClick={() => setFilter("PENDING_PAYMENT")}
              type="button"
            >
              Chờ thanh toán
              <span className="eh-filter-chip-count">{pendingCount}</span>
            </button>
            <button
              className={`eh-filter-chip ${filter === "CONFIRMED" ? "is-active" : ""}`}
              onClick={() => setFilter("CONFIRMED")}
              type="button"
            >
              Đã thanh toán
              <span className="eh-filter-chip-count">{confirmedCount}</span>
            </button>
            <button
              className={`eh-filter-chip ${filter === "CANCELLED" ? "is-active" : ""}`}
              onClick={() => setFilter("CANCELLED")}
              type="button"
            >
              Đã hủy
            </button>
          </div>

          <button
            className="btn btn-secondary"
            disabled={resource.loading}
            onClick={resource.reload}
            style={{ fontSize: "12px", padding: "0 14px", minHeight: "36px" }}
            type="button"
          >
            <LineIcon name="refresh" /> Làm mới
          </button>
        </div>

        <RequestState error={resource.error || error} loading={resource.loading} onRetry={resource.reload} />

        {/* Danh sách đơn hàng */}
        {visible.length > 0 ? (
          <div className="eh-bookings-list">
            {visible.map((booking) => {
              const conf = statusConfig[booking.status] || statusConfig.CONFIRMED;
              const isPending = booking.status === "PENDING_PAYMENT";

              return (
                <article className={`eh-booking-card ${isPending ? "is-pending" : ""}`} key={booking.id}>
                  {/* Header thẻ đơn */}
                  <div className="eh-booking-card-head">
                    <div className="eh-booking-id-group">
                      <small>Mã đơn hàng</small>
                      <span className="eh-booking-id-code">{booking.id}</span>
                      <button
                        aria-label="Sao chép mã đơn"
                        className="eh-copy-btn"
                        onClick={() => copyCode(booking.id)}
                        type="button"
                      >
                        <LineIcon name={copiedId === booking.id ? "check" : "copy"} />
                        <span>{copiedId === booking.id ? "Đã chép" : "Sao chép"}</span>
                      </button>
                    </div>

                    <div className="eh-booking-status-meta">
                      <span className="eh-booking-date">
                        Đặt lúc: {formatDateTime(booking.createdAt)}
                      </span>
                      <span className={`eh-status-pill ${conf.modifier}`}>
                        <LineIcon name={conf.icon} />
                        {conf.label}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết các dòng vé trong đơn */}
                  <div className="eh-booking-items-list">
                    {booking.items.map((item) => (
                      <div className="eh-booking-item-row" key={item.id}>
                        <div className="eh-item-info">
                          <Link className="eh-item-title" to={`/events/${item.eventId}`}>
                            {item.eventTitle}
                          </Link>
                          <div className="eh-item-sub">
                            <span className="eh-item-tag">{item.ticketTypeName}</span>
                            <span>· Đơn giá: {formatCurrency(item.unitPrice)}</span>
                          </div>
                        </div>

                        <div className="eh-item-pricing">
                          <span className="eh-item-qty">
                            Số lượng: <strong>{item.quantity}</strong>
                          </span>
                          <span className="eh-item-subtotal">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer đơn: Tổng tiền & Nút bấm ngữ cảnh */}
                  <div className="eh-booking-card-foot">
                    <div className="eh-booking-total">
                      <small>Tổng thanh toán:</small>
                      <strong>{formatCurrency(booking.totalAmount)}</strong>
                    </div>

                    <div className="eh-booking-actions">
                      {isPending && (
                        <>
                          <button
                            className="btn btn-secondary"
                            disabled={busy === booking.id}
                            onClick={() => cancel(booking.id)}
                            style={{ color: "#dc2626", fontSize: "12px", border: "1px solid #fecaca" }}
                            type="button"
                          >
                            <LineIcon name="trash" />
                            {busy === booking.id ? "Đang hủy..." : "Hủy đơn"}
                          </button>
                          <Link
                            className="btn btn-primary"
                            style={{ fontSize: "13px", padding: "0 22px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                            to={`/payment?bookingId=${encodeURIComponent(booking.id)}`}
                          >
                            <LineIcon name="card" /> Thanh toán VietQR ngay
                          </Link>
                        </>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <>
                          <Link
                            className="btn btn-secondary"
                            style={{ fontSize: "12px" }}
                            to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
                          >
                            Biên lai điện tử
                          </Link>
                          <Link
                            className="btn btn-primary"
                            style={{ fontSize: "13px", padding: "0 20px" }}
                            to="/my-tickets"
                          >
                            <LineIcon name="ticket" /> Mở vé của tôi
                          </Link>
                        </>
                      )}

                      {(booking.status === "CANCELLED" || booking.status === "EXPIRED") && booking.items[0]?.eventId && (
                        <Link
                          className="btn btn-secondary"
                          style={{ fontSize: "12px" }}
                          to={`/events/${booking.items[0].eventId}`}
                        >
                          <LineIcon name="arrow-right" /> Xem lại sự kiện
                        </Link>
                      )}
                    </div>
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
              description="Bạn chưa có đơn đặt vé nào trong nhóm này. Hãy khám phá hàng trăm sự kiện hấp dẫn và giữ chỗ ngay hôm nay."
              title="Chưa có đơn hàng nào"
            />
          )
        )}

        <PageNav
          disabled={resource.loading}
          onChange={setPage}
          page={page}
          totalPages={resource.data?.totalPages ?? 0}
        />
      </div>
    </CustomerLayout>
  );
}
