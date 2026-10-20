import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { RequestState } from "../components/ui/RequestState";
import { Button } from "../components/ui/Button";
import { createBookingApi } from "../api/booking";
import { getEventTicketTypes, getPublicEventById } from "../api/events";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../context/AuthContext";
import { readSelection } from "../utils/bookingState";
import { formatCurrency } from "../utils/format";

export function CheckoutPage() {
  const [params] = useSearchParams();
  const selection = readSelection(params);
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resource = useApiResource(async () => {
    if (!selection) throw new Error("Chưa có lựa chọn vé hợp lệ. Vui lòng chọn lại từ trang sự kiện.");
    const [event, types] = await Promise.all([getPublicEventById(selection.eventId), getEventTicketTypes(selection.eventId)]);
    const ticket = types.find(type => type.id === selection.ticketTypeId);
    if (!ticket || ticket.eventId !== event.id) throw new Error("Loại vé không thuộc sự kiện này.");
    if (ticket.quantity - ticket.soldQuantity < selection.quantity) throw new Error("Số lượng vé còn lại không đủ. Vui lòng chọn lại.");
    return { event, ticket };
  }, [selection?.eventId, selection?.ticketTypeId, selection?.quantity]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current || !selection || !resource.data) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const booking = await createBookingApi({ items: [{ ticketTypeId: selection.ticketTypeId, quantity: selection.quantity }] });
      navigate(`/payment?bookingId=${encodeURIComponent(booking.id)}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể tạo đơn. Kiểm tra Đơn hàng trước khi thử lại nếu mất kết nối.");
      submitting.current = false; setBusy(false);
    }
  }
  return <CheckoutLayout activeStep={2} title="Xác nhận đặt vé" eyebrow="Bước 2 · Đặt vé" description="Kiểm tra lựa chọn trước khi tạo đơn giữ chỗ." secureLabel="Tài khoản EventHub"
    aside={<section className="booking-card"><h2>Tạm tính</h2><strong>{resource.data && selection ? formatCurrency(resource.data.ticket.price * selection.quantity) : "—"}</strong><p>Giá và số lượng được hệ thống kiểm tra lại khi tạo đơn.</p></section>}>
    <RequestState loading={resource.loading} error={resource.error || error} onRetry={resource.error ? resource.reload : undefined} />
    {resource.data && selection && <form onSubmit={submit} className="checkout-form-card">
      <h2>{resource.data.event.title}</h2><p>{resource.data.ticket.name} × {selection.quantity}</p><p>{formatCurrency(resource.data.ticket.price)} / vé</p>
      <h3>Tài khoản nhận vé</h3><p>{user?.fullName} · {user?.email}</p><p>Đơn và vé thuộc tài khoản đang đăng nhập. Hiện chưa hỗ trợ người nhận khác, mã giảm giá hoặc hóa đơn.</p>
      <Button disabled={busy} type="submit">{busy ? "Đang tạo đơn…" : "Tạo đơn giữ chỗ"}</Button>
    </form>}
    <Link to={selection ? `/events/${selection.eventId}` : "/explore"}>Chọn lại vé</Link> · <Link to="/my-bookings">Kiểm tra đơn đã tạo</Link>
  </CheckoutLayout>;
}
