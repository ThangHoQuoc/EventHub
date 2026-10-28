import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { getBookingDetailApi } from "../api/booking";
import { createPaymentUrlApi } from "../api/payments";
import { useApiResource } from "../hooks/useApiResource";
import { formatCurrency } from "../utils/format";
import { LineIcon } from "../components/ui/LineIcon";

type PaymentMethod = "VNPAY" | "MANUAL_TRANSFER";

export function PaymentPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const [method, setMethod] = useState<PaymentMethod>("VNPAY");
  const [bankCode, setBankCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resource = useApiResource(
    () =>
      bookingId
        ? getBookingDetailApi(bookingId)
        : Promise.reject(new Error("Thiếu mã đơn. Vui lòng chọn đơn trong Đơn hàng.")),
    [bookingId]
  );

  const booking = resource.data;

  async function handleOnlinePayment() {
    if (!booking) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await createPaymentUrlApi({
        bookingId: booking.id,
        bankCode: bankCode ? bankCode : undefined,
      });
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ cổng.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Khởi tạo thanh toán thất bại.");
      setSubmitting(false);
    }
  }

  return (
    <CheckoutLayout
      activeStep={3}
      description="Chọn hình thức thanh toán an toàn để hoàn tất và nhận vé ngay tức thì."
      eyebrow="Bước 3 · Thanh toán trực tuyến"
      secureLabel="Cổng bảo mật SSL 256-bit"
      title="Thanh toán đơn đặt vé"
      aside={
        <section className="booking-card" style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>Hướng dẫn thanh toán</h2>
          <p style={{ fontSize: "13px", color: "var(--eh-muted)", lineHeight: "1.6" }}>
            EventHub hỗ trợ thanh toán trực tuyến tự động qua <strong>Cổng VNPay Sandbox</strong> (chấp nhận thẻ ATM nội địa, thẻ quốc tế và mã QR Ngân hàng).
          </p>
          <p style={{ fontSize: "13px", color: "var(--eh-muted)", lineHeight: "1.6" }}>
            Sau khi hoàn tất tại cổng VNPay, hệ thống sẽ tự động kích hoạt vé điện tử kèm mã QR Code trong vòng 5 giây.
          </p>
          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--eh-border)" }}>
            <Link to="/my-bookings" style={{ color: "var(--eh-green)", fontSize: "13px", fontWeight: "700" }}>
              ← Xem danh sách đơn hàng của tôi
            </Link>
          </div>
        </section>
      }
    >
      <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

      {booking && (
        <div style={{ display: "grid", gap: "28px" }}>
          {/* Chi tiết đơn */}
          <BookingDetails booking={booking} />

          {booking.status === "CONFIRMED" ? (
            <div style={{ padding: "20px", background: "var(--eh-green-50)", border: "1px solid var(--eh-green-100)", borderRadius: "var(--radius-lg)" }}>
              <strong style={{ color: "var(--eh-green)", display: "block", marginBottom: "8px" }}>
                ✓ Đơn hàng này đã được thanh toán thành công!
              </strong>
              <Link className="btn btn-primary" to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}>
                Mở vé điện tử ngay
              </Link>
            </div>
          ) : (
            <section style={{ background: "var(--eh-surface)", padding: "28px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 20px", color: "var(--eh-text)" }}>
                Chọn phương thức thanh toán
              </h3>

              {/* Tùy chọn 1: Cổng VNPay Sandbox */}
              <div
                onClick={() => setMethod("VNPAY")}
                style={{
                  border: `2px solid ${method === "VNPAY" ? "var(--eh-green)" : "var(--eh-border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "18px",
                  cursor: "pointer",
                  background: method === "VNPAY" ? "var(--eh-green-50)" : "transparent",
                  marginBottom: "16px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      checked={method === "VNPAY"}
                      id="opt-vnpay"
                      name="paymentMethod"
                      onChange={() => setMethod("VNPAY")}
                      type="radio"
                    />
                    <label htmlFor="opt-vnpay" style={{ fontWeight: "800", cursor: "pointer", fontSize: "15px" }}>
                      Cổng thanh toán trực tuyến VNPay Sandbox (Khuyên dùng)
                    </label>
                  </div>
                  <span style={{ fontSize: "11px", background: "var(--eh-green)", color: "#fff", padding: "2px 8px", borderRadius: "100px", fontWeight: "700" }}>
                    Tự động nhận vé ngay
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--eh-muted)", paddingLeft: "26px" }}>
                  Hỗ trợ ứng dụng ngân hàng quét VNPAY-QR, Thẻ ATM 40+ ngân hàng Việt Nam, và thẻ quốc tế Visa / MasterCard / JCB.
                </p>

                {method === "VNPAY" && (
                  <div style={{ paddingLeft: "26px", marginTop: "8px", display: "grid", gap: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-text)" }}>
                      Chọn nhanh phương thức con trên VNPay (Tùy chọn):
                    </label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        { code: "", label: "Cổng tổng hợp VNPay" },
                        { code: "VNPAYQR", label: "Quét mã VNPAY-QR" },
                        { code: "VNBANK", label: "Thẻ ATM / Internet Banking" },
                        { code: "INTCARD", label: "Thẻ Quốc tế (Visa/Master)" },
                      ].map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBankCode(b.code);
                          }}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${bankCode === b.code ? "var(--eh-green)" : "var(--eh-border)"}`,
                            background: bankCode === b.code ? "var(--eh-green)" : "#fff",
                            color: bankCode === b.code ? "#fff" : "var(--eh-text)",
                            cursor: "pointer",
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tùy chọn 2: Chuyển khoản VietQR */}
              <div
                onClick={() => setMethod("MANUAL_TRANSFER")}
                style={{
                  border: `2px solid ${method === "MANUAL_TRANSFER" ? "var(--eh-green)" : "var(--eh-border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "18px",
                  cursor: "pointer",
                  background: method === "MANUAL_TRANSFER" ? "var(--eh-green-50)" : "transparent",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    checked={method === "MANUAL_TRANSFER"}
                    id="opt-transfer"
                    name="paymentMethod"
                    onChange={() => setMethod("MANUAL_TRANSFER")}
                    type="radio"
                  />
                  <label htmlFor="opt-transfer" style={{ fontWeight: "800", cursor: "pointer", fontSize: "15px" }}>
                    Chuyển khoản ngân hàng VietQR (Đối soát thủ công)
                  </label>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--eh-muted)", paddingLeft: "26px" }}>
                  Chuyển khoản trực tiếp tới tài khoản ngân hàng của ban tổ chức. Vé sẽ được kích hoạt sau khi kiểm tra biến động số dư.
                </p>

                {method === "MANUAL_TRANSFER" && (
                  <div style={{ paddingLeft: "26px", marginTop: "12px", fontSize: "13px", color: "var(--eh-text)", display: "grid", gap: "6px" }}>
                    <div>Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong></div>
                    <div>Số tài khoản: <strong style={{ fontFamily: "monospace" }}>0987654321</strong></div>
                    <div>Chủ tài khoản: <strong>EVENTHUB CORP</strong></div>
                    <div>Số tiền: <strong style={{ color: "var(--eh-green)" }}>{formatCurrency(booking.totalAmount)}</strong></div>
                    <div>Nội dung chuyển khoản: <strong style={{ color: "#d93f0b", fontFamily: "monospace" }}>{booking.id}</strong></div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div style={{ color: "var(--eh-red)", padding: "12px", background: "var(--eh-red-50)", borderRadius: "var(--radius-md)", marginTop: "16px", fontSize: "13px" }}>
                  {errorMsg}
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: "24px", display: "flex", gap: "14px", alignItems: "center" }}>
                {method === "VNPAY" ? (
                  <button
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={handleOnlinePayment}
                    style={{ fontSize: "15px", padding: "12px 28px" }}
                    type="button"
                  >
                    {submitting ? "Đang chuyển tiếp tới VNPay..." : `Thanh toán ${formatCurrency(booking.totalAmount)} qua VNPay`}
                  </button>
                ) : (
                  <Link
                    className="btn btn-secondary"
                    to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
                    style={{ fontSize: "15px", padding: "12px 28px" }}
                  >
                    Tôi đã chuyển khoản thành công
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </CheckoutLayout>
  );
}
