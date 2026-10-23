import { Link, useParams } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { QRCode } from "../components/ui/QRCode";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getTicketDetailApi } from "../api/tickets";
import { useApiResource } from "../hooks/useApiResource";
import { formatDateTime } from "../utils/format";
import { ticketStatusLabel } from "./MyTicketsPage";

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const resource = useApiResource(
    () =>
      ticketId
        ? getTicketDetailApi(ticketId)
        : Promise.reject(new Error("Không tìm thấy mã vé.")),
    [ticketId]
  );
  const ticket = resource.data;
  const isValid = ticket?.status === "VALID";

  return (
    <CustomerLayout
      activeNav="tickets"
      description="Xuất trình màn hình vé này hoặc mã QR tại cổng kiểm soát vé của sự kiện."
      title="Vé điện tử chính thức"
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gap: "24px" }}>
        {/* Nút quay lại */}
        <div>
          <Link
            className="ev-text-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
            to="/my-tickets"
          >
            <span style={{ transform: "rotate(180deg)", display: "inline-block" }}>
              <LineIcon name="arrow-right" />
            </span>
            Quay lại danh sách vé của tôi
          </Link>
        </div>

        <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

        {ticket && (
          <>
            {/* Master Ticket */}
            <article
              className={`ev-master-ticket ${isValid ? "is-valid" : "is-used"}`}
              style={{
                background: "var(--eh-surface)",
                border: "1.5px solid var(--eh-border)",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--eh-shadow-card)",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr 280px",
              }}
            >
              {/* Thân vé bên trái */}
              <div style={{ padding: "32px 36px", display: "grid", gap: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.12em" }}>
                    EVENTHUB TICKETING SYSTEM
                  </span>
                  <span
                    className={`ev-ticket-status-pill ${isValid ? "status-valid" : "status-used"}`}
                    style={{
                      background: isValid ? "var(--eh-green-50)" : "#f1f3f4",
                      color: isValid ? "var(--eh-green)" : "var(--eh-muted)",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <LineIcon name={isValid ? "check" : "clock"} />
                    {ticketStatusLabel[ticket.status] || ticket.status}
                  </span>
                </div>

                <div>
                  <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "4px 0 8px", color: "var(--eh-text)", letterSpacing: "-0.04em", lineHeight: "1.2" }}>
                    {ticket.eventTitle}
                  </h1>
                  <span
                    style={{
                      background: "var(--eh-bg)",
                      border: "1px solid var(--eh-border)",
                      color: "var(--eh-text)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Hạng vé: {ticket.ticketTypeName}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "12px", borderTop: "1px solid var(--eh-border)" }}>
                  <div>
                    <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Thời gian cấp vé</small>
                    <strong style={{ color: "var(--eh-text)", fontSize: "13px" }}>{formatDateTime(ticket.issuedAt)}</strong>
                  </div>
                  <div>
                    <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Trạng thái check-in</small>
                    <strong style={{ color: isValid ? "var(--eh-green)" : "var(--eh-muted)", fontSize: "13px" }}>
                      {ticket.checkedInAt ? `Đã quét lúc: ${formatDateTime(ticket.checkedInAt)}` : "Chưa sử dụng"}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Mã đơn hàng liên kết</small>
                    <strong style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--eh-muted)" }}>
                      {ticket.bookingId}
                    </strong>
                  </div>
                  <div>
                    <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Trang sự kiện</small>
                    <Link className="ev-text-link" style={{ fontSize: "12px", fontWeight: "700" }} to={`/events/${ticket.eventId}`}>
                      Xem chi tiết sự kiện <LineIcon name="arrow-right" />
                    </Link>
                  </div>
                </div>

                <div style={{ background: "var(--eh-bg)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "12px", color: "var(--eh-muted)" }}>
                  <LineIcon name="info" /> <strong>Lưu ý:</strong> Mỗi mã vé chỉ có giá trị check-in một lần duy nhất tại cổng soát vé. Vui lòng không chụp gửi mã QR cho người khác.
                </div>
              </div>

              {/* Cuống vé bên phải */}
              <div
                style={{
                  background: "#faf8f5",
                  borderLeft: "2px dashed var(--eh-border)",
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "var(--radius-lg)", border: "1px solid var(--eh-border)", boxShadow: "var(--eh-shadow-sm)" }}>
                  <QRCode label={`Mã QR vé ${ticket.ticketCode}`} value={ticket.qrPayload} />
                </div>

                <div style={{ marginTop: "14px" }}>
                  <small style={{ fontSize: "10px", color: "var(--eh-placeholder)", fontWeight: "700", letterSpacing: "0.1em", display: "block" }}>
                    MÃ SOÁT VÉ
                  </small>
                  <strong style={{ fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.08em", color: "var(--eh-text)" }}>
                    {ticket.ticketCode}
                  </strong>
                </div>

                <div style={{ marginTop: "20px", display: "grid", gap: "8px", width: "100%" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                    style={{ width: "100%", justifyContent: "center" }}
                    type="button"
                  >
                    <LineIcon name="download" /> In vé điện tử
                  </button>
                  <button
                    className="btn btn-secondary"
                    disabled={resource.loading}
                    onClick={resource.reload}
                    style={{ width: "100%", justifyContent: "center" }}
                    type="button"
                  >
                    <LineIcon name="refresh" /> Đồng bộ trạng thái
                  </button>
                </div>
              </div>
            </article>

            {/* Hướng dẫn vào cổng */}
            <section style={{ background: "var(--eh-surface)", padding: "24px 28px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
                Hướng dẫn check-in tại địa điểm tổ chức
              </h3>
              <ol style={{ margin: 0, paddingLeft: "18px", color: "var(--eh-muted)", fontSize: "13px", lineHeight: "1.8", display: "grid", gap: "6px" }}>
                <li>Cổng check-in mở đón khách trước giờ khai mạc <strong>45 - 60 phút</strong>.</li>
                <li>Mở sẵn màn hình vé này với độ sáng màn hình điện thoại tối đa để máy quét laser đọc mã nhanh nhất.</li>
                <li>Bạn cũng có thể xuất trình bản in giấy của vé này nếu không mang điện thoại.</li>
              </ol>
            </section>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
