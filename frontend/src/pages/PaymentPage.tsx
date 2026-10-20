import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { BookingDetails } from "../components/customer/BookingDetails";
import { RequestState } from "../components/ui/RequestState";
import { PaymentMethodGroup } from "../components/checkout/PaymentMethodGroup";
import { QRPayPanel, BankGrid, CardForm, InvoiceAccordion } from "../components/checkout/PaymentPanels";
import { getBookingDetailApi } from "../api/booking";
import { useApiResource } from "../hooks/useApiResource";
import { useCountdown } from "../hooks/useCountdown";
import { formatCurrency } from "../utils/format";
import type { PaymentMethod } from "../types/checkout";
import { LineIcon } from "../components/ui/LineIcon";

export function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("bookingId");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("vnpay");
  const [copied, setCopied] = useState(false);

  // Đếm ngược 15 phút (900 giây) giữ chỗ
  const timer = useCountdown(900);

  const resource = useApiResource(
    () =>
      bookingId
        ? getBookingDetailApi(bookingId)
        : Promise.reject(new Error("Thiếu mã đơn. Vui lòng chọn đơn trong danh sách Đơn hàng.")),
    [bookingId]
  );

  const booking = resource.data;
  const isPending = booking?.status === "PENDING_PAYMENT";

  function copyBookingId() {
    if (!booking) return;
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleCheckResult() {
    if (booking) {
      navigate(`/payment/result?bookingId=${encodeURIComponent(booking.id)}`);
    }
  }

  return (
    <CheckoutLayout
      activeStep={3}
      description="Lựa chọn cổng thanh toán an toàn hoặc chuyển khoản theo thông tin đơn hàng."
      eyebrow="Bước 3 · Cổng thanh toán"
      secureLabel="Thanh toán 256-bit SSL"
      title="Hoàn tất thanh toán đơn vé"
      aside={
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Box đếm ngược giữ chỗ */}
          <section className="booking-card" style={{ borderColor: timer.expired ? "var(--eh-error)" : "var(--eh-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: timer.expired ? "var(--eh-error)" : "var(--eh-green)", fontWeight: "700", fontSize: "12px" }}>
              <LineIcon name="clock" />
              <span>{timer.expired ? "Thời gian giữ chỗ đã hết" : "Thời gian giữ vé còn lại"}</span>
            </div>
            <strong style={{ fontSize: "28px", color: timer.expired ? "var(--eh-error)" : "var(--eh-text)", letterSpacing: "-0.04em" }}>
              {timer.label}
            </strong>
            <p style={{ fontSize: "12px", color: "var(--eh-muted)", margin: 0 }}>
              Vé của bạn đang được khóa tạm thời trên hệ thống. Vui lòng hoàn tất giao dịch trước khi hết giờ để không bị giải phóng chỗ.
            </p>
          </section>

          {/* Hướng dẫn chuyển khoản trực tiếp */}
          <section className="booking-card">
            <h2>Chuyển khoản thủ công</h2>
            <p style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
              Quét mã QR hoặc chuyển khoản đến tài khoản ban tổ chức với nội dung chuyển khoản là mã đơn:
            </p>

            {booking && (
              <div style={{ background: "var(--eh-bg)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--eh-muted)" }}>Mã đơn hàng (Nội dung CK):</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--eh-text)", overflowWrap: "anywhere" }}>
                    {booking.id}
                  </strong>
                  <button
                    className="btn btn-secondary"
                    onClick={copyBookingId}
                    style={{ minHeight: "28px", fontSize: "11px", padding: "0 8px" }}
                    type="button"
                  >
                    {copied ? "Đã copy!" : "Copy mã"}
                  </button>
                </div>
                <span style={{ fontSize: "11px", color: "var(--eh-muted)", marginTop: "4px" }}>Số tiền:</span>
                <strong style={{ fontSize: "16px", color: "var(--eh-green)" }}>
                  {formatCurrency(booking.totalAmount)}
                </strong>
              </div>
            )}

            <div style={{ paddingTop: "10px", display: "grid", gap: "8px" }}>
              <button
                className="btn btn-primary"
                onClick={handleCheckResult}
                style={{ width: "100%", justifyContent: "center" }}
                type="button"
              >
                Kiểm tra kết quả đơn vé
              </button>
              <Link className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} to="/my-bookings">
                Về danh sách đơn hàng
              </Link>
            </div>
          </section>
        </div>
      }
    >
      <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

      {booking && (
        <div style={{ display: "grid", gap: "24px" }}>
          {/* Tóm tắt thông tin đơn hàng */}
          <BookingDetails booking={booking} />

          {/* Trạng thái đơn */}
          {!isPending && (
            <div
              style={{
                background: booking.status === "CONFIRMED" ? "var(--eh-green-50)" : "#fce8e6",
                border: `1px solid ${booking.status === "CONFIRMED" ? "var(--eh-green-100)" : "#fad2cf"}`,
                color: booking.status === "CONFIRMED" ? "var(--eh-green)" : "var(--eh-error)",
                padding: "16px 20px",
                borderRadius: "var(--radius-lg)",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {booking.status === "CONFIRMED"
                ? "Đơn hàng này đã được xác nhận thanh toán thành công. Bạn đã có vé!"
                : `Đơn hàng đang ở trạng thái: ${booking.status}.`}
            </div>
          )}

          {/* Khu vực chọn cổng thanh toán */}
          <section className="checkout-form-card">
            <h2>Chọn phương thức thanh toán</h2>
            <p style={{ color: "var(--eh-muted)", fontSize: "13px", marginTop: "4px", marginBottom: "18px" }}>
              Hệ thống bảo mật đa kênh, quét QR tiện lợi hoặc thanh toán qua thẻ ngân hàng.
            </p>

            <PaymentMethodGroup
              disabled={!isPending || timer.expired}
              onChange={setSelectedMethod}
              renderDetails={(method) => {
                if (method === "vnpay" || method === "momo") {
                  return (
                    <QRPayPanel
                      amount={booking.totalAmount}
                      expired={timer.expired}
                      method={method}
                      onRefresh={resource.reload}
                    />
                  );
                }
                if (method === "atm") {
                  return <BankGrid disabled={!isPending || timer.expired} />;
                }
                if (method === "card") {
                  return <CardForm disabled={!isPending || timer.expired} />;
                }
                return null;
              }}
              value={selectedMethod}
            />

            <div style={{ marginTop: "24px" }}>
              <InvoiceAccordion />
            </div>

            <div style={{ marginTop: "28px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                disabled={!isPending || timer.expired}
                onClick={handleCheckResult}
                style={{ minHeight: "46px", padding: "0 28px" }}
                type="button"
              >
                Tôi đã chuyển khoản xong · Kiểm tra vé
              </button>

              <Link
                className="btn btn-secondary"
                style={{ minHeight: "46px" }}
                to={`/payment/result?bookingId=${encodeURIComponent(booking.id)}`}
              >
                Xem chi tiết kết quả
              </Link>
            </div>
          </section>
        </div>
      )}
    </CheckoutLayout>
  );
}
