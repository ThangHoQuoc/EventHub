import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getBookingDetailApi, type BookingDto } from "../api/booking";
import { vnpayCallbackApi } from "../api/payments";
import { formatCurrency, formatDateTime } from "../utils/format";

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"success" | "processing" | "failed">("processing");

  const bookingIdParam = searchParams.get("bookingId");
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");

  const effectiveBookingId = bookingIdParam || vnpTxnRef || "";

  const loadResult = useCallback(async () => {
    if (!effectiveBookingId) {
      setError(new Error("Không tìm thấy thông tin đơn hàng hoặc mã tham chiếu thanh toán."));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (vnpResponseCode) {
        try {
          await vnpayCallbackApi(searchParams.toString());
        } catch (e) {
          console.warn("Callback verification api call completed:", e);
        }
      }

      const res = await getBookingDetailApi(effectiveBookingId);
      setBooking(res);

      if (res.status === "CONFIRMED") {
        setStatus("success");
      } else if (res.status === "PENDING_PAYMENT") {
        setStatus("processing");
      } else {
        setStatus("failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error("Lỗi khi tải kết quả đơn hàng."));
    } finally {
      setLoading(false);
    }
  }, [effectiveBookingId, vnpResponseCode, searchParams]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  return (
    <CustomerLayout
      activeNav="bookings"
      description="Chi tiết xác nhận thanh toán trực tuyến và vé điện tử check-in của bạn."
      title="Kết quả thanh toán"
    >
      <div className="ev-payment-result-container">
        <RequestState error={error ? error.message : undefined} loading={loading} onRetry={loadResult} />

        {!loading && booking && (
          <div className="ev-result-card-wrap">
            {/* Status Header */}
            {status === "success" && (
              <div className="ev-result-status-head success">
                <div className="ev-status-icon-ring">
                  <LineIcon name="check" />
                </div>
                <h1>Thanh toán thành công!</h1>
                <p>Cảm ơn bạn. Đơn đặt chỗ đã được xác nhận và vé điện tử đã được phát hành tự động.</p>
              </div>
            )}

            {status === "processing" && (
              <div className="ev-result-status-head processing">
                <div className="ev-status-icon-ring">
                  <LineIcon name="clock" />
                </div>
                <h1>Đang chờ xác nhận giao dịch</h1>
                <p>Hệ thống đang tiến hành đối soát số dư chuyển khoản. Vé sẽ tự động hiển thị trong ví vé của bạn.</p>
              </div>
            )}

            {status === "failed" && (
              <div className="ev-result-status-head failed">
                <div className="ev-status-icon-ring">
                  <LineIcon name="alert" />
                </div>
                <h1>Thanh toán chưa hoàn tất</h1>
                <p>Giao dịch thanh toán chưa thành công hoặc đã hết hạn giữ chỗ. Bạn có thể thử lại.</p>
              </div>
            )}

            {/* Chi tiết biên lai thanh toán */}
            <div className="ev-result-receipt-card">
              <div className="ev-receipt-header">
                <span>THÔNG TIN GIAO DỊCH</span>
                <span className={`ev-status-chip ${status}`}>
                  {status === "success" ? "ĐÃ XÁC NHẬN" : status === "processing" ? "CHỜ ĐỐI SOÁT" : "CHƯA HOÀN TẤT"}
                </span>
              </div>

              <div className="ev-receipt-body">
                <div className="ev-receipt-row">
                  <span>Mã đơn hàng</span>
                  <strong className="mono">{booking.id}</strong>
                </div>

                <div className="ev-receipt-row">
                  <span>Thời gian ghi nhận</span>
                  <span>{formatDateTime(booking.createdAt)}</span>
                </div>

                <div className="ev-receipt-row">
                  <span>Số tiền thanh toán</span>
                  <strong className="amount-highlight">{formatCurrency(booking.totalAmount)}</strong>
                </div>

                {booking.items && booking.items.length > 0 && (
                  <div className="ev-receipt-items">
                    <small>DANH SÁCH VÉ</small>
                    {booking.items.map((it, idx) => (
                      <div key={idx} className="ev-receipt-item-line">
                        <span>{it.ticketTypeName || "Vé sự kiện"} × {it.quantity}</span>
                        <strong>{formatCurrency(it.unitPrice * it.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ev-receipt-actions">
                {status === "success" ? (
                  <>
                    <Link to="/my-tickets" className="ev-primary-action-btn">
                      <span>Vào ví xem vé điện tử ngay</span>
                      <LineIcon name="arrow-right" />
                    </Link>
                    <Link to="/my-bookings" className="ev-secondary-action-btn">
                      Xem lịch sử đơn hàng
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={`/payment?bookingId=${encodeURIComponent(booking.id)}`} className="ev-primary-action-btn">
                      <span>Thử thanh toán lại</span>
                      <LineIcon name="arrow-right" />
                    </Link>
                    <Link to="/explore" className="ev-secondary-action-btn">
                      Quay về trang khám phá
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
