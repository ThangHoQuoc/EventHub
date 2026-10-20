import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { cancelBookingApi, getMyBookingsApi } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";

export function MyBookingsPage() {
  const [page, setPage] = useState(0);
  const resource = useApiResource(() => getMyBookingsApi({page, size: 10}), [page]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function cancel(id: string) {
    if (busy || !window.confirm("Hủy đơn giữ chỗ này và trả vé về hệ thống?")) return;
    setBusy(id); setError("");
    try {
      const updated = await cancelBookingApi(id);
      resource.setData(current => current && ({...current, content: current.content.map(item => item.id === id ? updated : item)}));
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể hủy đơn."); }
    finally { setBusy(""); }
  }
  return <CustomerLayout activeNav="bookings" title="Đơn hàng & Giữ chỗ" description="Đơn đặt vé và trạng thái xác nhận từ hệ thống.">
    <RequestState loading={resource.loading} error={resource.error || error} onRetry={resource.reload} />
    {resource.data?.content.map(booking => <article key={booking.id} className="checkout-form-card"><BookingDetails booking={booking} />
      <div className="ev-booking-actions">
        {booking.status === "PENDING_PAYMENT" && <><Link className="btn btn-primary" to={`/payment?bookingId=${booking.id}`}>Xem thanh toán</Link><button className="btn btn-secondary" disabled={!!busy} onClick={() => cancel(booking.id)}>{busy === booking.id ? "Đang hủy…" : "Hủy đơn"}</button></>}
        {booking.status === "CONFIRMED" && <Link to="/my-tickets">Xem vé</Link>}
      </div></article>)}
    {resource.data && !resource.data.content.length && <p role="status">Bạn chưa có đơn đặt vé.</p>}
    <PageNav page={page} totalPages={resource.data?.totalPages ?? 0} onChange={setPage} disabled={resource.loading} />
  </CustomerLayout>;
}
