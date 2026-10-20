import { Link, useSearchParams } from "react-router-dom";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { ResultHero, NextStepsList, AnimatedCheck } from "../components/checkout/ResultComponents";
import { QRCode } from "../components/ui/QRCode";
import { LineIcon } from "../components/ui/LineIcon";
import { getBookingDetailApi } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";
import { paymentResultStatus } from "../utils/bookingState";
import { formatCurrency, formatDateTime } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const { user } = useAuth();

  const resource = useApiResource(
    () =>
      bookingId
        ? getBookingDetailApi(bookingId)
        : Promise.reject(new Error("Thiếu mã đơn để kiểm tra kết quả.")),
    [bookingId]
  );

  const booking = resource.data;
  const status = paymentResultStatus(booking?.status);

  return (
    <div className={`checkout-flow-page result-page result-page--${status}`}>
      <CheckoutHeader
        activeStep={status === "success" ? 4 : 3}
        orderInProgress={status === "processing"}
        secureLabel="Hệ thống vé điện tử EventHub"
      />

      <main className="result-main">
        <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

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
                      <QRCode label={`Mã QR vé đơn ${booking.id}`} value={`EVENTHUB:BOOKING:${booking.id}`} />
                    </div>
                    <strong style={{ fontSize: "12px", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                      {booking.id.slice(0, 10).toUpperCase()}
                    </strong>
                    <small style={{ fontSize: "10px", color: "var(--eh-placeholder)" }}>Mã quét cổng</small>
                  </div>
                </article>

                {/* Nút hành động */}
                <div className="result-actions">
                  <Link className="checkout-button checkout-button--primary" to="/my-tickets">
                    <LineIcon name="ticket" /> Mở vé trong Ví của tôi
                  </Link>
                  <button
                    className="checkout-button checkout-button--outline"
                    onClick={() => window.print()}
                    type="button"
                  >
                    <LineIcon name="download" /> In / Tải vé PDF
                  </button>
                  <div>
                    <button onClick={resource.reload} type="button">
                      <LineIcon name="refresh" /> Đồng bộ trạng thái mới nhất
                    </button>
                  </div>
                  <Link className="result-explore-link" to="/explore">
                    Tiếp tục khám phá thêm sự kiện khác <LineIcon name="arrow-right" />
                  </Link>
                </div>

                {/* Các bước tiếp theo */}
                <NextStepsList />
              </div>
            )}

            {/* Trạng thái 2: Đang chờ xác nhận (PENDING_PAYMENT) */}
            {status === "processing" && (
              <div style={{ maxWidth: "680px", margin: "0 auto", display: "grid", gap: "24px" }}>
                <div className="result-state-card" style={{ background: "var(--eh-surface)", padding: "28px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)", boxShadow: "var(--eh-warm-shadow)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--eh-amber)", fontWeight: "700", marginBottom: "12px" }}>
                    <LineIcon name="clock" />
                    <span>Đơn hàng đang chờ đối chiếu thanh toán</span>
                  </div>
                  <p style={{ color: "var(--eh-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                    Nếu bạn đã quét mã QR hoặc chuyển khoản ngân hàng, hệ thống có thể cần từ 1 - 3 phút để ghi nhận giao dịch. Bạn không cần chuyển khoản lại.
                  </p>

                  <div style={{ margin: "16px 0", padding: "14px", background: "var(--eh-bg)", borderRadius: "var(--radius-md)" }}>
                    <BookingDetails booking={booking} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button
                      className="btn btn-primary"
                      disabled={resource.loading}
                      onClick={resource.reload}
                      style={{ flex: 1, justifyContent: "center" }}
                      type="button"
                    >
                      <LineIcon name="refresh" /> {resource.loading ? "Đang kiểm tra..." : "Kiểm tra lại ngay"}
                    </button>
                    <Link
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: "center" }}
                      to={`/payment?bookingId=${encodeURIComponent(booking.id)}`}
                    >
                      Xem lại mã QR thanh toán
                    </Link>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <Link className="ev-text-link" to="/my-bookings">
                    Xem tất cả đơn hàng của bạn trong mục Đơn hàng <LineIcon name="arrow-right" />
                  </Link>
                </div>
              </div>
            )}

            {/* Trạng thái 3: Hủy hoặc Hết hạn (CANCELLED / EXPIRED) */}
            {status === "failed" && (
              <div style={{ maxWidth: "600px", margin: "0 auto", display: "grid", gap: "20px", textAlign: "center" }}>
                <div style={{ background: "var(--eh-surface)", padding: "32px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--eh-error)", margin: "0 0 10px" }}>
                    Đơn hàng không còn hiệu lực
                  </h3>
                  <p style={{ color: "var(--eh-muted)", fontSize: "14px", marginBottom: "20px" }}>
                    Đơn giữ chỗ này đã bị hủy hoặc hết hạn thanh toán theo quy định thời gian của hệ thống. Vé đã được trả lại kho cho cộng đồng.
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <Link className="btn btn-primary" to="/explore">
                      Khám phá & Chọn vé khác
                    </Link>
                    <Link className="btn btn-secondary" to="/my-bookings">
                      Lịch sử đơn hàng
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
