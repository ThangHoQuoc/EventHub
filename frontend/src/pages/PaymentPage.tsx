import { Link, useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { getBookingDetailApi } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";

export function PaymentPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const resource = useApiResource(() => bookingId ? getBookingDetailApi(bookingId) : Promise.reject(new Error("Thiếu mã đơn. Vui lòng chọn đơn trong Đơn hàng.")), [bookingId]);
  return <CheckoutLayout activeStep={3} title="Trạng thái thanh toán" eyebrow="Bước 3 · Thanh toán" description="Thông tin được lấy từ đơn đặt vé trên hệ thống." secureLabel="Xác nhận thủ công"
    aside={<section className="booking-card"><h2>Hướng dẫn</h2><p>EventHub hiện hỗ trợ ADMIN xác nhận thanh toán thủ công. Liên hệ ban tổ chức và cung cấp mã đơn để được hướng dẫn thanh toán.</p><p>Cổng VNPay/MoMo và thanh toán thẻ chưa khả dụng. Trang này không thu tiền.</p><Link to="/my-bookings">Đơn hàng của tôi</Link></section>}>
    <RequestState loading={resource.loading} error={resource.error} onRetry={resource.reload} />
    {resource.data && <><BookingDetails booking={resource.data} />
      {resource.data.status === "PENDING_PAYMENT" && <p>Đơn chưa được xác nhận. Đơn chờ quá hạn sẽ được hệ thống giải phóng theo thời hạn của hệ thống.</p>}
      <Link className="btn btn-primary" to={`/payment/result?bookingId=${encodeURIComponent(resource.data.id)}`}>Kiểm tra kết quả</Link>
    </>}
  </CheckoutLayout>;
}
