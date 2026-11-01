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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  function handleCopy(text: string, field: string) {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <CheckoutLayout
      activeStep={3}
      description="Chọn hình thức thanh toán an toàn để hoàn tất và nhận vé ngay tức thì."
      eyebrow="Bước 3 · Thanh toán trực tuyến"
      secureLabel="Cổng bảo mật SSL 256-bit"
      title="Thanh toán đơn đặt vé"
      aside={
        <div className="ev-checkout-aside-wrap">
          <section className="ev-checkout-summary-card">
            <span className="ev-summary-badge">HƯỚNG DẪN THANH TOÁN</span>
            <div className="ev-guide-text">
              <p>
                EventHub hỗ trợ thanh toán trực tuyến tự động qua <strong>Cổng VNPay Sandbox</strong> (chấp nhận mã VNPAY-QR, Thẻ ATM 40+ ngân hàng Việt Nam và thẻ quốc tế Visa / MasterCard).
              </p>
              <p>
                Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt vé điện tử kèm mã QR Code trong vòng 5 giây.
              </p>
            </div>
            <div className="ev-guide-link-wrap">
              <Link to="/my-bookings" className="ev-guide-back-link">
                ← Xem danh sách đơn hàng của tôi
              </Link>
            </div>
          </section>
        </div>
      }
    >
      <RequestState
        error={resource.error}
        loading={resource.loading}
        onRetry={resource.reload}
      />

      {booking && (
        <div className="ev-payment-content-stack">
          {/* Chi tiết đơn */}
          <BookingDetails booking={booking} />

          {booking.status === "CONFIRMED" ? (
            <div className="ev-payment-already-confirmed">
              <LineIcon name="check" />
              <div>
                <strong>Đơn hàng này đã được thanh toán thành công!</strong>
                <p>Vé điện tử của bạn đã được phát hành tự động và sẵn sàng trong ví vé.</p>
              </div>
              <Link
                className="ev-open-ticket-btn"
                to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
              >
                <span>Mở vé điện tử ngay</span>
                <LineIcon name="arrow-right" />
              </Link>
            </div>
          ) : (
            <section className="ev-payment-methods-card">
              <div className="ev-card-title-row">
                <LineIcon name="card" />
                <h2>Chọn phương thức thanh toán</h2>
              </div>

              {/* Tùy chọn 1: Cổng VNPay Sandbox */}
              <div
                className={`ev-payment-option-card ${method === "VNPAY" ? "is-selected" : ""}`}
                onClick={() => setMethod("VNPAY")}
              >
                <div className="ev-option-top-row">
                  <div className="ev-option-radio-label">
                    <input
                      checked={method === "VNPAY"}
                      id="opt-vnpay"
                      name="paymentMethod"
                      onChange={() => setMethod("VNPAY")}
                      type="radio"
                    />
                    <label htmlFor="opt-vnpay">
                      Cổng thanh toán VNPay Sandbox (Khuyên dùng)
                    </label>
                  </div>
                  <span className="ev-instant-tag">Tự động nhận vé ngay</span>
                </div>

                <p className="ev-option-desc">
                  Hỗ trợ ứng dụng ngân hàng quét VNPAY-QR, Thẻ ATM 40+ ngân hàng Việt Nam, và thẻ quốc tế Visa / MasterCard / JCB.
                </p>

                {method === "VNPAY" && (
                  <div className="ev-sub-channels-box">
                    <span className="sub-channels-label">
                      Chọn nhanh kênh thanh toán trên VNPay (Tùy chọn):
                    </span>
                    <div className="sub-channels-btns">
                      {[
                        { code: "", label: "Cổng tổng hợp VNPay" },
                        { code: "VNPAYQR", label: "Quét mã VNPAY-QR" },
                        { code: "VNBANK", label: "Thẻ ATM / Internet Banking" },
                        { code: "INTCARD", label: "Thẻ Quốc tế (Visa/Master)" },
                      ].map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          className={`sub-channel-btn ${bankCode === b.code ? "is-active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBankCode(b.code);
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
                className={`ev-payment-option-card ${method === "MANUAL_TRANSFER" ? "is-selected" : ""}`}
                onClick={() => setMethod("MANUAL_TRANSFER")}
              >
                <div className="ev-option-top-row">
                  <div className="ev-option-radio-label">
                    <input
                      checked={method === "MANUAL_TRANSFER"}
                      id="opt-transfer"
                      name="paymentMethod"
                      onChange={() => setMethod("MANUAL_TRANSFER")}
                      type="radio"
                    />
                    <label htmlFor="opt-transfer">
                      Chuyển khoản ngân hàng VietQR (Đối soát thủ công)
                    </label>
                  </div>
                </div>

                <p className="ev-option-desc">
                  Chuyển khoản trực tiếp tới tài khoản ngân hàng của ban tổ chức. Vé sẽ được kích hoạt sau khi kiểm tra biến động số dư.
                </p>

                {method === "MANUAL_TRANSFER" && (
                  <div className="ev-transfer-details-box">
                    <div className="transfer-data-row">
                      <span>Ngân hàng thụ hưởng:</span>
                      <strong>MBBank (Ngân hàng Quân Đội)</strong>
                    </div>

                    <div className="transfer-data-row">
                      <span>Số tài khoản:</span>
                      <div className="copyable-wrap">
                        <strong className="mono">0987654321</strong>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy("0987654321", "acc");
                          }}
                        >
                          {copiedField === "acc" ? "Đã chép!" : "Sao chép"}
                        </button>
                      </div>
                    </div>

                    <div className="transfer-data-row">
                      <span>Chủ tài khoản:</span>
                      <strong>EVENTHUB CORP</strong>
                    </div>

                    <div className="transfer-data-row">
                      <span>Số tiền chuyển chính xác:</span>
                      <strong className="amount-highlight">
                        {formatCurrency(booking.totalAmount)}
                      </strong>
                    </div>

                    <div className="transfer-data-row">
                      <span>Nội dung chuyển khoản (Bắt buộc):</span>
                      <div className="copyable-wrap">
                        <strong className="mono code-highlight">{booking.id}</strong>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(booking.id, "content");
                          }}
                        >
                          {copiedField === "content" ? "Đã chép!" : "Sao chép"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="ev-payment-error-alert">
                  {errorMsg}
                </div>
              )}

              {/* Action Button */}
              <div className="ev-payment-actions-bar">
                {method === "VNPAY" ? (
                  <button
                    className="ev-payment-submit-btn"
                    disabled={submitting}
                    onClick={handleOnlinePayment}
                    type="button"
                  >
                    <span>
                      {submitting
                        ? "Đang chuyển tiếp tới VNPay..."
                        : `Thanh toán ${formatCurrency(booking.totalAmount)} qua VNPay`}
                    </span>
                    <LineIcon name="arrow-right" />
                  </button>
                ) : (
                  <Link
                    className="ev-payment-submit-btn"
                    to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
                  >
                    <span>Tôi đã chuyển khoản thành công</span>
                    <LineIcon name="arrow-right" />
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
