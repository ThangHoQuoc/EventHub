import { Link } from "react-router-dom";
import type { BookingDto } from "../../api/booking";
import { formatCurrency, formatDate } from "../../utils/format";
import { bookingStatusLabel } from "../../utils/bookingState";

export function BookingDetails({ booking }: { booking: BookingDto }) {
  return <section className="checkout-form-card">
    <h2>Đơn đặt vé</h2><p>Mã đơn: <strong style={{ overflowWrap: "anywhere" }}>{booking.id}</strong></p>
    <p>Ngày đặt: {formatDate(booking.createdAt)}</p><p role="status">{bookingStatusLabel(booking.status)}</p>
    {booking.items.map(item => <div className="ticket-line-item" key={item.id}>
      <Link to={`/events/${item.eventId}`}>{item.eventTitle}</Link><p>{item.ticketTypeName} × {item.quantity}</p>
      <p>{formatCurrency(item.unitPrice)} / vé · {formatCurrency(item.subtotal)}</p>
    </div>)}
    <div className="total-row"><span>Tổng tiền từ hệ thống</span><strong>{formatCurrency(booking.totalAmount)}</strong></div>
  </section>;
}
