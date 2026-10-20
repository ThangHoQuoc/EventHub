import { Link, useParams } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { QRCode } from "../components/ui/QRCode";
import { EmptyState } from "../components/ui/EmptyState";
import { mockIssuedTickets } from "../data/mockCustomer";
import { formatCurrency, formatDate } from "../utils/format";

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const ticket = mockIssuedTickets.find((t) => t.id === ticketId) ?? mockIssuedTickets[0];

  if (!ticket) {
    return (
      <CustomerLayout
        activeNav="tickets"
        description="Không tìm thấy vé tương ứng."
        title="Chi tiết vé"
      >
        <EmptyState
          actionLabel="Về danh sách vé"
          actionTo="/my-tickets"
          description="Vé này có thể không tồn tại hoặc bạn chưa được cấp quyền."
          title="Không tìm thấy vé"
        />
      </CustomerLayout>
    );
  }

  const isValid = ticket.status === "VALID";

  return (
    <CustomerLayout
      activeNav="tickets"
      description="Xuất trình màn hình vé này hoặc mã QR tại cổng kiểm soát vé."
      title="Vé điện tử chi tiết"
    >
      <div className="ev-ticket-detail-view">
        <div className="ev-ticket-detail-back">
          <Link to="/my-tickets">
            <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>
              <LineIcon name="arrow-right" />
            </span>
            Quay lại danh sách vé của tôi
          </Link>
        </div>

        {/* Master Ticket Presentation */}
        <div className={`ev-master-ticket ${isValid ? "is-valid" : "is-used"}`}>
          <div className="ev-master-ticket-body">
            <div className="ev-master-kicker">
              <span>VÉ CHÍNH THỨC · EVENTHUB</span>
              <span className={`ev-ticket-status-pill ${isValid ? "status-valid" : "status-used"}`}>
                <LineIcon name={isValid ? "check" : "clock"} />
                {isValid ? "Có hiệu lực check-in" : "Đã check-in"}
              </span>
            </div>

            <h1>{ticket.event.title}</h1>

            <div className="ev-master-meta-grid">
              <div>
                <small>Thời gian bắt đầu</small>
                <strong>{formatDate(ticket.event.startAt)}</strong>
                <span>
                  {new Date(ticket.event.startAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <small>Địa điểm tổ chức</small>
                <strong>{ticket.event.location}</strong>
                <span>{ticket.event.city}</span>
              </div>
              <div>
                <small>Hạng vé & Chỗ ngồi</small>
                <strong>{ticket.ticketTypeName}</strong>
                <span>{ticket.seatInfo || "Khu vực khán phòng tự do"}</span>
              </div>
              <div>
                <small>Giá vé đã thanh toán</small>
                <strong>{formatCurrency(ticket.price)}</strong>
                <span>Mã đơn: {ticket.orderCode}</span>
              </div>
            </div>

            <div className="ev-master-holder-row">
              <div>
                <small>Người sở hữu</small>
                <strong>{ticket.holderName}</strong>
              </div>
              <div>
                <small>Email nhận vé</small>
                <span>{ticket.holderEmail}</span>
              </div>
              <div>
                <small>Số điện thoại</small>
                <span>{ticket.holderPhone}</span>
              </div>
            </div>

            <div className="ev-master-notice">
              <LineIcon name="info" />
              <span>
                Vui lòng chuẩn bị sẵn mã QR trên điện thoại trước khi đến quầy check-in. Mỗi mã chỉ có hiệu lực cho một lượt vào cửa.
              </span>
            </div>
          </div>

          {/* Master Stub */}
          <div className="ev-master-ticket-stub">
            <div className="ev-master-qr-box">
              <QRCode label={`Mã QR vé ${ticket.ticketCode}`} />
            </div>
            <div className="ev-master-code-display">
              <small>MÃ SOÁT VÉ</small>
              <strong>{ticket.ticketCode}</strong>
            </div>

            <div className="ev-master-actions">
              <button
                className="ev-ticket-btn-primary"
                onClick={() => window.print()}
                type="button"
              >
                <LineIcon name="download" />
                Tải vé PDF / In
              </button>
              <button
                className="ev-ticket-btn-outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: ticket.event.title,
                      text: `Vé sự kiện ${ticket.event.title} - Mã vé: ${ticket.ticketCode}`,
                    });
                  } else {
                    alert("Đã sao chép mã vé: " + ticket.ticketCode);
                  }
                }}
                type="button"
              >
                <LineIcon name="share" />
                Chia sẻ thông tin
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
