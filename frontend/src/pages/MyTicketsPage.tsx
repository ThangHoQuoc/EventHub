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

  const visible = allTickets.filter((ticket) => filter === "ALL" || ticket.status === filter);

  return (
    <CustomerLayout
      activeNav="tickets"
      description="Quản lý toàn bộ vé tham dự sự kiện của bạn. Mỗi vé đi kèm một mã QR duy nhất để check-in tại cổng."
      title="Vé điện tử của tôi"
    >
      <div style={{ display: "grid", gap: "24px" }}>
        {/* Bộ lọc tab trạng thái vé */}
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
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Tất cả ({allTickets.length})
            </button>
            <button
              onClick={() => setFilter("VALID")}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: 0,
                background: filter === "VALID" ? "var(--eh-green)" : "transparent",
                color: filter === "VALID" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Có hiệu lực ({validCount})
            </button>
            <button
              onClick={() => setFilter("USED")}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: 0,
                background: filter === "USED" ? "var(--eh-green)" : "transparent",
                color: filter === "USED" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Đã check-in ({usedCount})
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

        <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

        {/* Lưới danh sách vé điện tử */}
        {visible.length > 0 ? (
          <div style={{ display: "grid", gap: "18px" }}>
            {visible.map((ticket) => {
              const isValid = ticket.status === "VALID";
              return (
                <article
                  key={ticket.id}
                  style={{
                    background: "var(--eh-surface)",
                    border: "1px solid var(--eh-border)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--eh-shadow-sm)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "1fr 200px",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  {/* Thân vé bên trái */}
                  <div style={{ padding: "24px 28px", display: "grid", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          background: "var(--eh-green-50)",
                          border: "1px solid var(--eh-green-100)",
                          color: "var(--eh-green)",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-md)",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        {ticket.ticketTypeName}
                      </span>
                      <span
                        style={{
                          background: isValid ? "var(--eh-green-50)" : "#f1f3f4",
                          color: isValid ? "var(--eh-green)" : "var(--eh-muted)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <LineIcon name={isValid ? "check" : "clock"} />
                        {ticketStatusLabel[ticket.status] || ticket.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "2px 0 0", color: "var(--eh-text)", letterSpacing: "-0.03em" }}>
                      {ticket.eventTitle}
                    </h3>

                    <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--eh-muted)", flexWrap: "wrap" }}>
                      <span>
                        <LineIcon name="calendar" /> Cấp lúc: {formatDateTime(ticket.issuedAt)}
                      </span>
                      {ticket.checkedInAt && (
                        <span style={{ color: "var(--eh-text)" }}>
                          <LineIcon name="check" /> Check-in: {formatDateTime(ticket.checkedInAt)}
                        </span>
                      )}
                      <span>
                        <LineIcon name="ticket" /> Đơn: <code style={{ fontFamily: "monospace" }}>{ticket.bookingId.slice(0, 8)}</code>
                      </span>
                    </div>

                    <div style={{ paddingTop: "8px", display: "flex", gap: "14px", alignItems: "center" }}>
                      <Link
                        className="btn btn-primary"
                        style={{ fontSize: "12px", padding: "0 16px", minHeight: "36px" }}
                        to={`/my-tickets/${ticket.id}`}
                      >
                        Mở mã vé & QR toàn màn hình
                      </Link>
                      <Link
                        className="ev-text-link"
                        style={{ fontSize: "12px" }}
                        to={`/events/${ticket.eventId}`}
                      >
                        Chi tiết sự kiện <LineIcon name="arrow-right" />
                      </Link>
                    </div>
                  </div>

                  {/* Cuống vé mini bên phải */}
                  <div
                    style={{
                      background: "#faf8f5",
                      borderLeft: "2px dashed var(--eh-border)",
                      padding: "20px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ background: "#ffffff", padding: "6px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", width: "86px", height: "86px" }}>
                      <QRCode label={`Mã QR vé ${ticket.ticketCode}`} value={ticket.qrPayload} />
                    </div>
                    <small style={{ fontSize: "9px", color: "var(--eh-placeholder)", marginTop: "8px", fontWeight: "700" }}>
                      MÃ CHECK-IN
                    </small>
                    <strong style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--eh-text)", letterSpacing: "0.05em" }}>
                      {ticket.ticketCode}
                    </strong>
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

        <div style={{ textAlign: "center", paddingTop: "8px" }}>
          <Link className="ev-text-link" to="/my-bookings">
            Xem lịch sử đơn đặt vé tại mục Đơn hàng <LineIcon name="arrow-right" />
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
