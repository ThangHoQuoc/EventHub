import { Link } from "react-router-dom";
import type { CheckoutOrder, ResultStatus } from "../../types/checkout";
import { formatDate } from "../../utils/format";
import { EventPoster } from "../event/EventPoster";
import { LineIcon } from "../ui/LineIcon";
import { QRCode } from "../ui/QRCode";
import { CopyButton, MoneyText } from "./CheckoutUi";

export function AnimatedCheck() {
  return <div className="animated-check" aria-hidden="true"><span><LineIcon name="check" /></span><i /></div>;
}

type ResultHeroProps = {
  status: ResultStatus;
  email?: string;
};

export function ResultHero({ email, status }: ResultHeroProps) {
  const content = status === "success"
    ? { title: "Đặt vé thành công!", text: `Vé đã được gửi đến ${email}.` }
    : status === "failed"
      ? { title: "Thanh toán chưa thành công", text: "Ngân hàng chưa thể hoàn tất giao dịch này. Bạn vẫn còn thời gian để thử lại." }
      : { title: "Đang xác nhận thanh toán", text: "Ngân hàng có thể cần thêm một chút thời gian. Bạn không cần thanh toán lại." };
  return <header className={`result-hero result-hero--${status}`} tabIndex={-1}>{status === "success" ? <AnimatedCheck /> : <div className="result-state-icon"><LineIcon name={status === "failed" ? "alert" : "clock"} /><i /></div>}<span>{status === "success" ? "Hoàn tất" : status === "failed" ? "Cần bạn kiểm tra" : "Đang xử lý"}</span><h1>{content.title}</h1><p>{content.text}</p></header>;
}

export function SummaryStrip({ order, status }: { order: CheckoutOrder; status: ResultStatus }) {
  const total = order.tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0) + order.serviceFee - order.discount;
  return <dl className="result-summary-strip"><div><dt>Mã đơn hàng</dt><dd>{order.orderCode}<CopyButton label="" value={order.orderCode} /></dd></div><div><dt>{status === "success" ? "Tổng tiền đã thanh toán" : "Giá trị đơn hàng"}</dt><dd><MoneyText value={total} /></dd></div><div><dt>Thời gian thanh toán</dt><dd>{status === "success" ? "09/10/2026 · 20:42" : "Đang cập nhật"}</dd></div></dl>;
}

export function ETicketCard({ order }: { order: CheckoutOrder }) {
  return (
    <article className="e-ticket-card" aria-label={`Vé sự kiện ${order.event.title}`}>
      <div className="e-ticket-main"><EventPoster event={order.event} variant="wide" /><div className="e-ticket-copy"><span>VÉ ĐIỆN TỬ · EVENTHUB</span><h2>{order.event.title}</h2><p><LineIcon name="calendar" />{formatDate(order.event.startAt)} · 18:30</p><p><LineIcon name="map-pin" />{order.event.location}, {order.event.city}</p><div><span><small>Hạng vé</small><strong>{order.tickets.map((ticket) => `${ticket.quantity} × ${ticket.name}`).join(" · ")}</strong></span><span><small>Người sở hữu</small><strong>{order.recipient.fullName}</strong></span></div></div></div>
      <div className="e-ticket-stub"><span className="e-ticket-status"><LineIcon name="check" />Đã thanh toán</span><QRCode label="Mã QR xem trước của vé" /><strong>EH8F3K</strong><small>Mã xem trước</small><i /></div>
    </article>
  );
}

export function ResultActions() {
  return <div className="result-actions"><Link className="checkout-button checkout-button--primary" to="#tickets"><LineIcon name="ticket" />Xem vé của tôi</Link><button className="checkout-button checkout-button--outline" onClick={() => window.print()} type="button"><LineIcon name="download" />Tải vé PDF</button><div><button type="button"><LineIcon name="calendar" />Thêm vào Google Calendar</button><button type="button"><LineIcon name="share" />Chia sẻ sự kiện</button></div><Link className="result-explore-link" to="/explore">Tiếp tục khám phá sự kiện <LineIcon name="arrow-right" /></Link></div>;
}

const nextSteps = [
  ["ticket", "Vé được lưu trong tài khoản của bạn"],
  ["mail", "Email xác nhận đã được gửi"],
  ["qr", "Xuất trình mã QR khi check-in"],
  ["info", "Liên hệ hỗ trợ nếu bạn không nhận được vé"],
] as const;

export function NextStepsList() {
  return <section className="next-steps"><span>Thông tin tiếp theo</span><h2>Mọi thứ đã sẵn sàng.</h2><ul>{nextSteps.map(([icon, text], index) => <li key={text}><span>{icon === "qr" ? <QRCode label="" /> : <LineIcon name={icon} />}</span><div><small>0{index + 1}</small><strong>{text}</strong></div></li>)}</ul></section>;
}

