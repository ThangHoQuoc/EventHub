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
  { label: string; bg: string; color: string; border: string; icon: "check" | "clock" | "alert" }
> = {
  CONFIRMED: {
    label: "Đã thanh toán & Có vé",
    bg: "var(--eh-green-50)",
    color: "var(--eh-green)",
    border: "var(--eh-green-100)",
    icon: "check",
  },
  PENDING_PAYMENT: {
    label: "Đang giữ chỗ (Chờ thanh toán)",
    bg: "#fef3e0",
    color: "#b45309",
    border: "#fde68a",
    icon: "clock",
  },
  CANCELLED: {
    label: "Đã hủy đơn",
    bg: "#f3f4f6",
    color: "#6b7280",
    border: "#e5e7eb",
    icon: "alert",
  },
  EXPIRED: {
    label: "Hết hạn thanh toán",
    bg: "#fee2e2",
    color: "#b91c1c",
    border: "#fecaca",
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
      description="Lịch sử các đơn đặt vé, trạng thái giữ chỗ tạm thời và thông tin hóa đơn thanh toán."
      title="Đơn hàng & Giữ chỗ"
    >
      <div style={{ display: "grid", gap: "24px" }}>
        {/* Thanh lọc trạng thái đơn */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            background: "var(--eh-surface)",
            padding: "8px 12px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--eh-border)",
          }}
        >
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFilter("ALL")}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: 0,
                background: filter === "ALL" ? "var(--eh-green)" : "transparent",
                color: filter === "ALL" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
              type="button"
            >
              Tất cả ({allBookings.length})
            </button>
            <button
              onClick={() => setFilter("PENDING_PAYMENT")}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: 0,
                background: filter === "PENDING_PAYMENT" ? "var(--eh-green)" : "transparent",
                color: filter === "PENDING_PAYMENT" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
              type="button"
            >
              Chờ thanh toán ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("CONFIRMED")}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: 0,
                background: filter === "CONFIRMED" ? "var(--eh-green)" : "transparent",
                color: filter === "CONFIRMED" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
              type="button"
            >
              Đã thanh toán ({confirmedCount})
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
          <div style={{ display: "grid", gap: "20px" }}>
            {visible.map((booking) => {
              const conf = statusConfig[booking.status] || statusConfig.CONFIRMED;
              const isPending = booking.status === "PENDING_PAYMENT";

              return (
                <article
                  key={booking.id}
                  style={{
                    background: "var(--eh-surface)",
                    border: `1.5px solid ${isPending ? "#fde68a" : "var(--eh-border)"}`,
                    borderRadius: "var(--radius-xl)",
                    boxShadow: isPending ? "0 4px 16px rgba(245, 158, 11, 0.12)" : "var(--eh-shadow-sm)",
                    overflow: "hidden",
                    padding: "24px 28px",
                    display: "grid",
                    gap: "18px",
                  }}
                >
                  {/* Header thẻ đơn */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--eh-border)",
                      paddingBottom: "14px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>Mã đơn:</span>
                      <strong style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--eh-text)" }}>
                        {booking.id}
                      </strong>
                      <button
                        className="btn btn-secondary"
                        onClick={() => copyCode(booking.id)}
                        style={{ minHeight: "26px", fontSize: "11px", padding: "0 8px" }}
                        type="button"
                      >
                        {copiedId === booking.id ? "Đã copy!" : "Copy"}
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "12px", color: "var(--eh-placeholder)" }}>
                        {formatDateTime(booking.createdAt)}
                      </span>
                      <span
                        style={{
                          background: conf.bg,
                          color: conf.color,
                          border: `1px solid ${conf.border}`,
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <LineIcon name={conf.icon} />
                        {conf.label}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết các dòng vé trong đơn */}
                  <div style={{ display: "grid", gap: "10px" }}>
                    {booking.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--eh-bg)",
                          padding: "12px 16px",
                          borderRadius: "var(--radius-md)",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--eh-text)", display: "block" }}>
                            {item.eventTitle}
                          </strong>
                          <span style={{ color: "var(--eh-muted)", fontSize: "12px" }}>
                            {item.ticketTypeName} · Đơn giá: {formatCurrency(item.unitPrice)}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "var(--eh-muted)", fontSize: "12px", marginRight: "12px" }}>
                            SL: <strong>{item.quantity}</strong>
                          </span>
                          <strong style={{ color: "var(--eh-text)", fontSize: "14px" }}>
                            {formatCurrency(item.subtotal)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer đơn: Tổng tiền & Nút bấm */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--eh-border)",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "13px", color: "var(--eh-muted)" }}>Tổng thanh toán:</span>
                      <strong style={{ fontSize: "20px", color: "var(--eh-green)", fontWeight: "900", letterSpacing: "-0.03em" }}>
                        {formatCurrency(booking.totalAmount)}
                      </strong>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {isPending && (
                        <>
                          <button
                            className="btn btn-secondary"
                            disabled={busy === booking.id}
                            onClick={() => cancel(booking.id)}
                            style={{ color: "var(--eh-error)", fontSize: "12px" }}
                            type="button"
                          >
                            {busy === booking.id ? "Đang hủy..." : "Hủy đơn giữ chỗ"}
                          </button>
                          <Link
                            className="btn btn-primary"
                            style={{ fontSize: "13px", padding: "0 20px" }}
                            to={`/payment?bookingId=${encodeURIComponent(booking.id)}`}
                          >
                            <LineIcon name="card" /> Thanh toán ngay
                          </Link>
                        </>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <>
                          <Link
                            className="btn btn-primary"
                            style={{ fontSize: "13px", padding: "0 18px" }}
                            to="/my-tickets"
                          >
                            <LineIcon name="ticket" /> Mở vé của tôi
                          </Link>
                          <Link
                            className="btn btn-secondary"
                            style={{ fontSize: "12px" }}
                            to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
                          >
                            Xem biên lai
                          </Link>
                        </>
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
              description="Bạn chưa có đơn đặt vé nào trong nhóm này. Khám phá các sự kiện hấp dẫn và giữ chỗ ngay."
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
