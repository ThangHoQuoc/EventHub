import { Link } from "react-router-dom";
import type { CheckoutOrder } from "../../types/checkout";
import { formatCurrency, formatDate } from "../../utils/format";
import { EventPoster } from "../event/EventPoster";
import { LineIcon } from "../ui/LineIcon";
import { CopyButton, HoldTimer, MoneyText } from "./CheckoutUi";

type OrderSummaryProps = {
  order: CheckoutOrder;
  compact?: boolean;
  footer?: React.ReactNode;
  holdSeconds?: number;
  onHoldExpire?: () => void;
};

export function OrderSummary({ compact = false, footer, holdSeconds = 600, onHoldExpire, order }: OrderSummaryProps) {
  const subtotal = order.tickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0);
  const total = subtotal + order.serviceFee - order.discount;

  return (
    <section className={`order-summary ${compact ? "order-summary--compact" : ""}`} aria-label="Tóm tắt đơn hàng">
      <div className="order-summary-event">
        <EventPoster event={order.event} />
        <div><span>Sự kiện của bạn</span><h2>{order.event.title}</h2><p><LineIcon name="calendar" />{formatDate(order.event.startAt)}</p><p><LineIcon name="map-pin" />{order.event.location}, {order.event.city}</p></div>
      </div>
      {compact ? <div className="order-recipient"><span>Người nhận vé</span><strong>{order.recipient.fullName}</strong><Link to="/checkout">Sửa</Link></div> : null}
      <div className="order-ticket-lines">{order.tickets.map((ticket) => <div key={ticket.id}><span>{ticket.quantity} × {ticket.name}</span><MoneyText value={ticket.price * ticket.quantity} /></div>)}</div>
      {compact ? <div className="order-code"><span>Mã đơn hàng</span><strong>{order.orderCode}</strong><CopyButton label="" value={order.orderCode} /></div> : null}
      <div className="price-breakdown">
        <div><span>Tạm tính</span><MoneyText value={subtotal} /></div>
        <div><span>Phí dịch vụ</span><MoneyText value={order.serviceFee} /></div>
        {order.discount ? <div className="price-discount"><span>Giảm giá</span><span>−{formatCurrency(order.discount)}</span></div> : null}
        <div className="price-total"><span>Tổng thanh toán</span><MoneyText value={total} /></div>
      </div>
      {footer}
      <HoldTimer initialSeconds={holdSeconds} onExpire={onHoldExpire} />
      <p className="order-trust"><LineIcon name="shield" />Thanh toán bảo mật · Không có chi phí ẩn</p>
    </section>
  );
}
