import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { RequestState } from "../components/ui/RequestState";
import { ResultHero, NextStepsList } from "../components/checkout/ResultComponents";
import { LineIcon } from "../components/ui/LineIcon";
import { getBookingDetailApi, type BookingDto } from "../api/booking";
import { vnpayCallbackApi } from "../api/payments";
import { paymentResultStatus } from "../utils/bookingState";
import { formatCurrency, formatDateTime } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const rawBookingId = params.get("bookingId") || params.get("vnp_TxnRef");
  const isVnpayRedirect = Boolean(params.get("vnp_SecureHash"));
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadResult() {
    if (!rawBookingId) {
      setError(new Error("Thiếu mã đơn để kiểm tra kết quả giao dịch."));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Nếu redirect từ VNPay về, gọi xác thực callback trước
      if (isVnpayRedirect) {
        try {
          await vnpayCallbackApi(window.location.search);
        } catch (err) {
          console.warn("VNPay callback verification note:", err);
        }
      }

      // Tải trạng thái mới nhất của đơn hàng
      const res = await getBookingDetailApi(rawBookingId);
      setBooking(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không thể kiểm tra kết quả thanh toán"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResult();
  }, [rawBookingId]);

  const status = paymentResultStatus(booking?.status);

  return (
    <div className={`checkout-flow-page result-page result-page--${status}`}>
      <CheckoutHeader
        activeStep={status === "success" ? 4 : 3}
        orderInProgress={status === "processing"}
        secureLabel="Hệ thống vé điện tử EventHub"
      />

      <main className="result-main">
        <RequestState error={error ? error.message : undefined} loading={loading} onRetry={loadResult} />

        {booking && (
          <>
            {/* Header thông báo trạng thái */}
            <ResultHero email={user?.email || "email của bạn"} status={status} />

            {/* Trạng thái 1: Thành công (CONFIRMED) */}
            {status === "success" && (
              <div style={{ display: "grid", gap: "32px", width: "100%", maxWidth: "880px", margin: "0 auto" }}>
                {/* Cuống vé điện tử Master E-Ticket */}
                <article className="e-ticket-card" aria-label="Vé điện tử EventHub">
                  <div className="e-ticket-main">
                    <div className="e-ticket-copy">
                      <span style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>
                        VÉ CHÍNH THỨC · EVENTHUB E-TICKET
                      </span>
                      <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "8px 0 16px", color: "var(--eh-text)" }}>
                        {booking.items[0]?.eventTitle || "Sự kiện EventHub"}
                      </h2>
                      <p style={{ color: "var(--eh-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <LineIcon name="calendar" /> {formatDateTime(booking.createdAt)}
                      </p>
                      <p style={{ color: "var(--eh-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <LineIcon name="ticket" /> Mã đơn: <strong style={{ fontFamily: "monospace" }}>{booking.id}</strong>
                      </p>

                      <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--eh-border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Hạng vé</small>
                          <strong style={{ fontSize: "14px", color: "var(--eh-text)" }}>
                            {booking.items.map((it) => `${it.quantity} × ${it.ticketTypeName}`).join(", ")}
                          </strong>
                        </div>
                        <div>
                          <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Người sở hữu</small>
                          <strong style={{ fontSize: "14px", color: "var(--eh-text)" }}>
                            {user?.fullName || user?.email}
                          </strong>
                        </div>
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
                  Đơn đặt vé này đã bị hủy hoặc hết hạn thanh toán (quá thời hạn 15 phút). Chỗ đã được hoàn trả lại cho sự kiện.
                </p>
                <div>
                  <Link className="btn btn-primary" to="/events">
                    Đặt lại vé mới
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
