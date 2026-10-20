import { Link, useSearchParams } from "react-router-dom";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { getBookingDetailApi } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";
import { paymentResultStatus } from "../utils/bookingState";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const resource = useApiResource(() => bookingId ? getBookingDetailApi(bookingId) : Promise.reject(new Error("Thiếu mã đơn để kiểm tra kết quả.")), [bookingId]);
  const status = paymentResultStatus(resource.data?.status);
  return <div className={`checkout-flow-page result-page result-page--${status}`}>
    <CheckoutHeader activeStep={status === "success" ? 4 : 3} orderInProgress={status === "processing"} secureLabel="Kết quả từ hệ thống" />
    <main className="result-main"><h1>{resource.data ? status === "success" ? "Đặt vé đã được xác nhận" : status === "failed" ? "Đơn không còn hiệu lực" : "Chờ xác nhận thanh toán" : "Kiểm tra kết quả"}</h1>
      <RequestState loading={resource.loading} error={resource.error} onRetry={resource.reload} />
      {resource.data && <BookingDetails booking={resource.data} />}
      <div className="result-state-actions"><button className="btn btn-primary" disabled={resource.loading} onClick={resource.reload}>Kiểm tra lại</button>
        {status === "success" && <Link className="btn btn-secondary" to="/my-tickets">Xem vé đã phát hành</Link>}
        <Link to="/my-bookings">Đơn hàng của tôi</Link></div>
    </main>
  </div>;
}
