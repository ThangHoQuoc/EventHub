import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { QRCode } from "../components/ui/QRCode";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getTicketDetailApi, resendTicketEmailApi } from "../api/tickets";
import { useApiResource } from "../hooks/useApiResource";
import { formatDateTime } from "../utils/format";
import { ticketStatusLabel } from "./MyTicketsPage";

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ message: string; success: boolean } | null>(null);

  const resource = useApiResource(
    () =>
      ticketId
        ? getTicketDetailApi(ticketId)
        : Promise.reject(new Error("Không tìm thấy mã vé.")),
    [ticketId]
  );
  const ticket = resource.data;
  const isValid = ticket?.status === "VALID";

  const handleResendEmail = async () => {
    if (!ticket?.ticketCode) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      await resendTicketEmailApi(ticket.ticketCode);
      setEmailStatus({
        message: "Vé điện tử kèm mã QR check-in đã được gửi tới email của bạn!",
        success: true,
      });
    } catch {
      setEmailStatus({
        message: "Chưa thể gửi email lúc này. Vui lòng thử lại sau.",
        success: false,
      });
    } finally {
      setSendingEmail(false);
    }
  };

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
              <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                    <span className="badge badge-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                      {ticket.ticketTypeName}
                    </span>
                    <span className={`badge ${isValid ? "badge-success" : "badge-neutral"}`}>
                      {ticketStatusLabel[ticket.status]}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--eh-text)", lineHeight: "1.3", margin: "0 0 16px" }}>
                    {ticket.eventTitle}
                  </h2>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", margin: "20px 0" }}>
                    <div>
                      <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", fontWeight: "600", textTransform: "uppercase" }}>
                        Thời gian phát hành
                      </small>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-text)", marginTop: "2px" }}>
                        {formatDateTime(ticket.issuedAt)}
                      </div>
                    </div>
                    {ticket.checkedInAt && (
                      <div>
                        <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", fontWeight: "600", textTransform: "uppercase" }}>
                          Thời gian Check-in
                        </small>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-green)", marginTop: "2px" }}>
                          {formatDateTime(ticket.checkedInAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed var(--eh-border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
                    Mã đơn hàng: <strong style={{ color: "var(--eh-text)" }}>{ticket.bookingId}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
                    EventHub Official E-Ticket
                  </div>
                </div>
              </div>

              {/* Cuống vé chứa mã QR bên phải */}
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

                <div style={{ marginTop: "18px", display: "grid", gap: "8px", width: "100%" }}>
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
                    disabled={sendingEmail}
                    onClick={handleResendEmail}
                    style={{ width: "100%", justifyContent: "center" }}
                    type="button"
                  >
                    <LineIcon name="mail" /> {sendingEmail ? "Đang gửi email..." : "Gửi vé vào Email"}
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

                {emailStatus && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      lineHeight: "1.4",
                      background: emailStatus.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: emailStatus.success ? "var(--eh-green)" : "var(--eh-red)",
                      border: `1px solid ${emailStatus.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    }}
                  >
                    {emailStatus.message}
                  </div>
                )}
              </div>
            </article>

            {/* Hướng dẫn vào cổng */}
            <section style={{ background: "var(--eh-surface)", padding: "24px 28px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
                Hướng dẫn check-in tại địa điểm tổ chức
              </h3>
              <ol style={{ margin: 0, paddingLeft: "18px", color: "var(--eh-muted)", fontSize: "13px", lineHeight: "1.8", display: "grid", gap: "6px" }}>
                <li>Cổng check-in mở đón khách trước giờ khai mạc <strong>45 - 60 phút</strong>.</li>
                <li>Mở sẵn màn hình vé này hoặc xuất trình email có mã QR để nhân viên quét laser nhanh chóng.</li>
                <li>Bạn cũng có thể xuất trình bản in giấy của vé này nếu không mang điện thoại.</li>
              </ol>
            </section>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
