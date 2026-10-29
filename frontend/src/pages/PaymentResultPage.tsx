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
      <div className="payment-result-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "10px 0 40px" }}>
        <RequestState error={error ? error.message : undefined} loading={loading} onRetry={loadResult} />

        {!loading && booking && (
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Header Icon & Status Heading */}
            <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
              {status === "success" && (
                <div>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "var(--eh-green)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "32px",
                      border: "2px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <LineIcon name="check" />
                  </div>
                  <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", margin: "0 0 8px" }}>
                    Thanh toán thành công!
                  </h1>
                  <p style={{ color: "var(--eh-muted)", fontSize: "15px", margin: 0 }}>
                    Cảm ơn bạn. Đơn đặt chỗ đã được xác nhận và vé điện tử đã được phát hành tự động.
                  </p>
                </div>
              )}

              {status === "processing" && (
                <div>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "rgba(245, 158, 11, 0.12)",
                      color: "var(--eh-orange)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "32px",
                      border: "2px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <LineIcon name="refresh" />
                  </div>
                  <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--eh-text)", margin: "0 0 8px" }}>
                    Đang chờ xác nhận giao dịch...
                  </h1>
                </div>
              )}

              {status === "failed" && (
                <div>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "var(--eh-red)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "32px",
                      border: "2px solid rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <LineIcon name="x" />
                  </div>
                  <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--eh-text)", margin: "0 0 8px" }}>
                    Giao dịch chưa hoàn tất
                  </h1>
                </div>
              )}
            </div>

            {/* Trạng thái 1: Thành công */}
            {status === "success" && (
              <div>
                {/* Thông báo vé điện tử qua Email */}
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    borderRadius: "12px",
                    padding: "14px 20px",
                    margin: "0 auto 20px",
                    maxWidth: "680px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    color: "var(--eh-green)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>✉️</span>
                  <div>
                    <strong>Vé điện tử kèm mã QR check-in</strong> đã được tự động gửi tới email của bạn. Bạn cũng có thể mở hoặc in trực tiếp trong mục <em>Vé của tôi</em>.
                  </div>
                </div>

                <article className="e-ticket-card" style={{ maxWidth: "680px", margin: "0 auto 28px" }}>
                  <div className="e-ticket-body">
                    <span className="e-ticket-badge" style={{ background: "rgba(37,99,235,0.1)", color: "var(--eh-primary)" }}>
                      EventHub Ticket Pass
                    </span>
                    <h2 className="e-ticket-title" style={{ fontSize: "20px", margin: "10px 0 16px" }}>
                      Đơn hàng #{booking.id.slice(0, 8)}
                    </h2>
                    <div className="e-ticket-meta" style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                      <div>
                        <strong style={{ color: "var(--eh-text)" }}>Tổng thanh toán: </strong>
                        <span style={{ color: "var(--eh-green)", fontWeight: "700", fontSize: "16px" }}>
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: "var(--eh-text)" }}>Thời gian đặt: </strong>
                        <span>{formatDateTime(booking.createdAt)}</span>
                      </div>
                      <div>
                        <strong style={{ color: "var(--eh-text)" }}>Số lượng loại vé: </strong>
                        <span>{booking.items?.length || 0} mục</span>
                      </div>
                    </div>
                  </div>

                  <div className="e-ticket-stub">
                    <span className="e-ticket-status">
                      <LineIcon name="check" /> Đã xác nhận
                    </span>
                    <div style={{ margin: "14px 0 8px" }}>
                      <Link to="/my-tickets" style={{ color: "var(--eh-green)", fontWeight: "700" }}>
                        Mở QR vé đã phát hành
                      </Link>
                    </div>
                    <strong style={{ fontSize: "12px", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                      {booking.id.slice(0, 10).toUpperCase()}
                    </strong>
                    <small style={{ fontSize: "10px", color: "var(--eh-placeholder)" }}>Mã tham chiếu đơn hàng</small>
                  </div>
                </article>

                {/* Nút hành động */}
                <div className="result-actions" style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
                  <Link className="btn btn-primary" to="/my-tickets" style={{ padding: "12px 24px", fontSize: "15px" }}>
                    <LineIcon name="ticket" /> Mở vé trong Ví của tôi
                  </Link>
                  <Link className="btn btn-secondary" to="/events" style={{ padding: "12px 24px", fontSize: "15px" }}>
                    Khám phá sự kiện khác
                  </Link>
                </div>
              </div>
            )}

            {/* Trạng thái 2: Đang chờ (PENDING_PAYMENT) */}
            {status === "processing" && (
              <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", display: "grid", gap: "20px" }}>
                <p style={{ color: "var(--eh-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                  Đơn hàng của bạn đang ở trạng thái chờ thanh toán. Nếu đã thực hiện chuyển khoản, vui lòng đợi 1-2 phút để hệ thống cập nhật.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button className="btn btn-primary" onClick={loadResult} type="button">
                    Làm mới trạng thái
                  </button>
                  <Link className="btn btn-secondary" to={`/payment?bookingId=${encodeURIComponent(booking.id)}`}>
                    Thanh toán lại qua VNPay
                  </Link>
                </div>
              </div>
            )}

            {/* Trạng thái 3: Hủy hoặc Hết hạn */}
            {status === "failed" && (
              <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", display: "grid", gap: "20px" }}>
                <p style={{ color: "var(--eh-red)", fontSize: "14px" }}>
                  Đơn hàng chưa được thanh toán thành công hoặc đã bị quá hạn giữ chỗ (15 phút).
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <Link className="btn btn-primary" to="/events">
                    Quay lại tìm sự kiện
                  </Link>
                  <Link className="btn btn-secondary" to="/my-bookings">
                    Xem lịch sử đơn đặt
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
