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
      <div className="ev-ticket-detail-container">
        {/* Nút quay lại */}
        <div className="ev-detail-back-wrap">
          <Link className="ev-ticket-back-btn" to="/my-tickets">
            <span className="back-arrow">
              <LineIcon name="arrow-right" />
            </span>
            <span>Quay lại danh sách vé của tôi</span>
          </Link>
        </div>

        <RequestState
          error={resource.error}
          loading={resource.loading}
          onRetry={resource.reload}
        />

        {ticket && (
          <div className="ev-master-pass-stack">
            {/* Master Ticket Pass */}
            <article className={`ev-master-vip-ticket ${isValid ? "is-valid" : "is-used"}`}>
              {/* Thân vé bên trái */}
              <div className="ev-master-ticket-body">
                <div>
                  <div className="ev-master-topline">
                    <span className="ev-master-type-pill">
                      {ticket.ticketTypeName}
                    </span>
                    <span
                      className={`ev-master-status-pill ${
                        isValid ? "status-valid" : "status-used"
                      }`}
                    >
                      <LineIcon name={isValid ? "check" : "clock"} />
                      <span>{ticketStatusLabel[ticket.status]}</span>
                    </span>
                  </div>

                  <h2 className="ev-master-event-title">{ticket.eventTitle}</h2>

                  <div className="ev-master-grid-meta">
                    <div className="meta-box">
                      <small>THỜI GIAN PHÁT HÀNH</small>
                      <strong>{formatDateTime(ticket.issuedAt)}</strong>
                    </div>
                    {ticket.checkedInAt && (
                      <div className="meta-box checked-in">
                        <small>THỜI GIAN CHECK-IN</small>
                        <strong>{formatDateTime(ticket.checkedInAt)}</strong>
                      </div>
                    )}
                    <div className="meta-box">
                      <small>MÃ ĐƠN HÀNG</small>
                      <strong className="mono">{ticket.bookingId}</strong>
                    </div>
                  </div>
                </div>

                <div className="ev-master-ticket-footer">
                  <div className="footer-brand">
                    <LineIcon name="ticket" />
                    <span>EventHub Official E-Ticket</span>
                  </div>
                  <div className="footer-verified">
                    <LineIcon name="shield" />
                    <span>Xác thực bởi EventHub</span>
                  </div>
                </div>
              </div>

              {/* Rãnh khuyết xé cuống vé */}
              <div className="ev-master-perforation">
                <span className="master-notch top" />
                <div className="master-dashed-line" />
                <span className="master-notch bottom" />
              </div>

              {/* Cuống vé chứa mã QR bên phải */}
              <div className="ev-master-ticket-stub">
                <div className="ev-master-qr-wrap">
                  <QRCode
                    label={`Mã QR vé ${ticket.ticketCode}`}
                    value={ticket.qrPayload}
                  />
                </div>

                <div className="ev-master-code-box">
                  <small>MÃ SOÁT VÉ</small>
                  <strong>{ticket.ticketCode}</strong>
                </div>

                {/* Các nút thao tác */}
                <div className="ev-master-actions-list">
                  <button
                    className="ev-master-btn primary"
                    onClick={() => window.print()}
                    type="button"
                  >
                    <LineIcon name="download" />
                    <span>In vé / Lưu PDF</span>
                  </button>

                  <button
                    className="ev-master-btn secondary"
                    disabled={sendingEmail}
                    onClick={handleResendEmail}
                    type="button"
                  >
                    <LineIcon name="mail" />
                    <span>{sendingEmail ? "Đang gửi email..." : "Gửi vé vào Email"}</span>
                  </button>

                  <button
                    className="ev-master-btn secondary"
                    disabled={resource.loading}
                    onClick={resource.reload}
                    type="button"
                  >
                    <LineIcon name="refresh" />
                    <span>Đồng bộ trạng thái</span>
                  </button>
                </div>

                {emailStatus && (
                  <div
                    className={`ev-email-status-alert ${
                      emailStatus.success ? "success" : "error"
                    }`}
                  >
                    {emailStatus.message}
                  </div>
                )}
              </div>
            </article>

            {/* Hướng dẫn vào cổng */}
            <section className="ev-checkin-guide-card">
              <div className="guide-card-head">
                <LineIcon name="ticket" />
                <h3>Hướng dẫn check-in tại địa điểm tổ chức</h3>
              </div>
              <ol className="guide-steps-list">
                <li>
                  Cổng check-in thường mở đón khách trước giờ khai mạc <strong>45 - 60 phút</strong>.
                </li>
                <li>
                  Mở sẵn màn hình vé này hoặc xuất trình mã QR từ email để nhân viên soát vé quét laser nhanh chóng.
                </li>
                <li>
                  Tăng độ sáng màn hình điện thoại tối đa để máy quét nhận diện mã QR dễ dàng hơn.
                </li>
              </ol>
            </section>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
