import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { RequestState } from "../components/ui/RequestState";
import { createBookingApi } from "../api/booking";
import { getEventTicketTypes, getPublicEventById } from "../api/events";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../context/AuthContext";
import { readSelection } from "../utils/bookingState";
import { formatCurrency, formatDateTime } from "../utils/format";
import { EventPoster } from "../components/event/EventPoster";
import { LineIcon } from "../components/ui/LineIcon";

export function CheckoutPage() {
  const [params] = useSearchParams();
  const selection = readSelection(params);
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitting = useRef(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(true);

  // Voucher state
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");

  const resource = useApiResource(async () => {
    if (!selection) throw new Error("Chưa có lựa chọn vé hợp lệ. Vui lòng chọn vé từ trang sự kiện.");
    const [event, types] = await Promise.all([
      getPublicEventById(selection.eventId),
      getEventTicketTypes(selection.eventId),
    ]);
    const ticket = types.find((type) => type.id === selection.ticketTypeId);
    if (!ticket || ticket.eventId !== event.id) throw new Error("Loại vé không thuộc sự kiện này.");
    if (ticket.quantity - ticket.soldQuantity < selection.quantity) {
      throw new Error("Số lượng vé khả dụng không đủ cho số lượng bạn chọn. Vui lòng chọn lại.");
    }
    return { event, ticket };
  }, [selection?.eventId, selection?.ticketTypeId, selection?.quantity]);

  const rawSubtotal = resource.data && selection ? resource.data.ticket.price * selection.quantity : 0;
  const finalTotal = Math.max(0, rawSubtotal - appliedDiscount);

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    setPromoError("");
    setPromoMessage("");

    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "EVENTHUB50") {
      setAppliedDiscount(50000);
      setPromoMessage("Áp dụng mã EVENTHUB50 thành công: Giảm 50.000đ!");
    } else if (code === "WELCOME2026") {
      setAppliedDiscount(30000);
      setPromoMessage("Áp dụng mã WELCOME2026 thành công: Giảm 30.000đ!");
    } else {
      setPromoError("Mã ưu đãi không hợp lệ hoặc đã hết lượt áp dụng.");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current || !selection || !resource.data) return;
    if (!agreed) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ và Quy định mua vé.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError("");

    try {
      const booking = await createBookingApi({
        items: [{ ticketTypeId: selection.ticketTypeId, quantity: selection.quantity }],
      });
      navigate(`/payment?bookingId=${encodeURIComponent(booking.id)}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Chưa thể tạo đơn đặt vé. Vui lòng kiểm tra mục Đơn hàng hoặc thử lại."
      );
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <CheckoutLayout
      activeStep={2}
      description="Kiểm tra thông tin chi tiết vé và xác nhận giữ chỗ trước khi chuyển sang bước thanh toán."
      eyebrow="Bước 2 · Xác nhận giỏ vé"
      secureLabel="Tài khoản bảo mật EventHub"
      title="Xác nhận đơn đặt vé"
      aside={
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Tóm tắt chi phí đơn hàng */}
          <section className="booking-card" style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <span style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>
              TỔNG KẾT ĐƠN HÀNG
            </span>

            {resource.data && selection && (
              <div style={{ margin: "14px 0", paddingBottom: "14px", borderBottom: "1px solid var(--eh-border)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0, background: "var(--eh-bg)" }}>
                  {resource.data.event.thumbnailUrl ? (
                    <img
                      alt={resource.data.event.title}
                      src={resource.data.event.thumbnailUrl}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--eh-placeholder)" }}>
                      <LineIcon name="ticket" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 4px", color: "var(--eh-text)", lineHeight: "1.3" }}>
                    {resource.data.event.title}
                  </h3>
                  <small style={{ color: "var(--eh-muted)", fontSize: "11px" }}>
                    {resource.data.ticket.name} · SL: {selection.quantity}
                  </small>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)" }}>
                <span>Tiền vé ({selection?.quantity || 1} vé)</span>
                <strong style={{ color: "var(--eh-text)" }}>{formatCurrency(rawSubtotal)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)" }}>
                <span>Phí dịch vụ nền tảng</span>
                <span style={{ color: "var(--eh-green)", fontWeight: "700" }}>Miễn phí</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-green)" }}>
                  <span>Ưu đãi voucher</span>
                  <strong>−{formatCurrency(appliedDiscount)}</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--eh-border)", alignItems: "baseline" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--eh-text)" }}>Tổng thanh toán</span>
                <strong style={{ fontSize: "22px", color: "var(--eh-green)", fontWeight: "900", letterSpacing: "-0.03em" }}>
                  {formatCurrency(finalTotal)}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: "18px", padding: "12px", background: "var(--eh-bg)", borderRadius: "var(--radius-md)", fontSize: "11px", color: "var(--eh-muted)", display: "flex", gap: "8px", alignItems: "center" }}>
              <LineIcon name="shield" />
              <span>Vé được bảo lưu 15 phút ngay sau khi bấm Tạo đơn giữ chỗ.</span>
            </div>
          </section>
        </div>
      }
    >
      <RequestState error={resource.error || error} loading={resource.loading} onRetry={resource.error ? resource.reload : undefined} />

      {resource.data && selection && (
        <form className="checkout-form-card" onSubmit={submit} style={{ display: "grid", gap: "24px" }}>
          {/* Thông tin vé đã chọn */}
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px", color: "var(--eh-text)" }}>
              Chi tiết vé tham dự
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px", background: "var(--eh-bg)", borderRadius: "var(--radius-lg)" }}>
              <div>
                <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Sự kiện</small>
                <strong style={{ fontSize: "14px", color: "var(--eh-text)" }}>{resource.data.event.title}</strong>
              </div>
              <div>
                <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Hạng vé & Số lượng</small>
                <strong style={{ fontSize: "14px", color: "var(--eh-text)" }}>
                  {resource.data.ticket.name} × {selection.quantity} vé
                </strong>
              </div>
              <div>
                <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Thời gian khai mạc</small>
                <span style={{ fontSize: "13px", color: "var(--eh-muted)" }}>{formatDateTime(resource.data.event.startAt)}</span>
              </div>
              <div>
                <small style={{ fontSize: "11px", color: "var(--eh-placeholder)", display: "block" }}>Địa điểm tổ chức</small>
                <span style={{ fontSize: "13px", color: "var(--eh-muted)" }}>{resource.data.event.location}</span>
              </div>
            </div>
          </section>

          {/* Thông tin tài khoản nhận vé */}
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
              Tài khoản nhận vé điện tử
            </h2>
            <div style={{ display: "grid", gap: "8px", fontSize: "13px", color: "var(--eh-muted)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span>Họ và tên:</span>
                <strong style={{ color: "var(--eh-text)" }}>{user?.fullName || "Chưa cập nhật tên"}</strong>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span>Email nhận vé:</span>
                <strong style={{ color: "var(--eh-text)" }}>{user?.email}</strong>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--eh-placeholder)" }}>
                Vé điện tử và mã QR check-in sẽ được liên kết trực tiếp vào tài khoản này và gửi bản sao tới email trên.
              </p>
            </div>
          </section>

          {/* Nhập mã ưu đãi / Voucher */}
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
              Mã giảm giá / Ưu đãi
            </h2>
            <div style={{ display: "flex", gap: "10px", maxWidth: "420px" }}>
              <input
                disabled={busy}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập EVENTHUB50 hoặc WELCOME2026"
                style={{ flex: 1, height: "44px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 14px" }}
                value={promoCode}
              />
              <button
                className="btn btn-secondary"
                onClick={applyPromo}
                style={{ height: "44px", padding: "0 18px", flexShrink: 0 }}
                type="button"
              >
                Áp dụng
              </button>
            </div>

            {promoMessage && (
              <p style={{ color: "var(--eh-green)", fontSize: "12px", fontWeight: "600", marginTop: "8px" }}>
                <LineIcon name="check" /> {promoMessage}
              </p>
            )}
            {promoError && (
              <p style={{ color: "var(--eh-error)", fontSize: "12px", fontWeight: "600", marginTop: "8px" }}>
                {promoError}
              </p>
            )}
          </section>

          {/* Hộp kiểm điều khoản */}
          <div style={{ padding: "8px 4px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "var(--eh-muted)", cursor: "pointer" }}>
              <input
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: "3px" }}
                type="checkbox"
              />
              <span>
                Tôi đồng ý với <strong>Điều khoản dịch vụ</strong> của EventHub, xác nhận thông tin vé đã chính xác và hiểu rõ chính sách không hoàn tiền sau khi phát hành vé.
              </span>
            </label>
          </div>

          {/* Nút submit */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="ev-btn-primary"
              disabled={busy || !agreed}
              style={{ minHeight: "50px", padding: "0 36px", fontSize: "15px" }}
              type="submit"
            >
              {busy ? "Đang tạo đơn giữ chỗ..." : "Tạo đơn giữ chỗ & Chuyển sang thanh toán"}
            </button>
            <Link
              className="ev-text-link"
              style={{ fontSize: "13px" }}
              to={selection ? `/events/${selection.eventId}` : "/explore"}
            >
              Chọn lại loại vé khác
            </Link>
          </div>
        </form>
      )}
    </CheckoutLayout>
  );
}
