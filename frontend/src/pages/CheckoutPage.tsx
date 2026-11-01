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
    if (!selection)
      throw new Error("Chưa có lựa chọn vé hợp lệ. Vui lòng chọn vé từ trang sự kiện.");
    const [event, types] = await Promise.all([
      getPublicEventById(selection.eventId),
      getEventTicketTypes(selection.eventId),
    ]);
    const ticket = types.find((type) => type.id === selection.ticketTypeId);
    if (!ticket || ticket.eventId !== event.id)
      throw new Error("Loại vé không thuộc sự kiện này.");
    if (ticket.quantity - ticket.soldQuantity < selection.quantity) {
      throw new Error("Số lượng vé khả dụng không đủ cho số lượng bạn chọn. Vui lòng chọn lại.");
    }
    return { event, ticket };
  }, [selection?.eventId, selection?.ticketTypeId, selection?.quantity]);

  const rawSubtotal =
    resource.data && selection ? resource.data.ticket.price * selection.quantity : 0;
  const finalTotal = Math.max(0, rawSubtotal - appliedDiscount);

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    setAppliedDiscount(0);
    setPromoMessage("");
    setPromoError("Mã ưu đãi chưa được hỗ trợ; tổng tiền không giảm.");
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
        <div className="ev-checkout-aside-wrap">
          {/* Card Tóm tắt chi phí đơn hàng */}
          <section className="ev-checkout-summary-card">
            <span className="ev-summary-badge">TỔNG KẾT ĐƠN HÀNG</span>

            {resource.data && selection && (
              <div className="ev-summary-event-row">
                <div className="ev-summary-thumb">
                  <img
                    alt={resource.data.event.title}
                    src={
                      resource.data.event.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80"
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                </div>
                <div className="ev-summary-info">
                  <h4>{resource.data.event.title}</h4>
                  <small>
                    Hạng vé: <strong>{resource.data.ticket.name}</strong> · SL:{" "}
                    <strong>{selection.quantity} vé</strong>
                  </small>
                </div>
              </div>
            )}

            <div className="ev-summary-lines">
              <div className="ev-line-item">
                <span>Tiền vé ({selection?.quantity || 1} vé)</span>
                <strong>{formatCurrency(rawSubtotal)}</strong>
              </div>
              <div className="ev-line-item">
                <span>Phí dịch vụ nền tảng</span>
                <span className="free-tag">Miễn phí</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="ev-line-item discount">
                  <span>Ưu đãi voucher</span>
                  <strong>−{formatCurrency(appliedDiscount)}</strong>
                </div>
              )}
              <div className="ev-line-total">
                <span>Tổng thanh toán</span>
                <strong className="total-amount">{formatCurrency(finalTotal)}</strong>
              </div>
            </div>

            <div className="ev-summary-notice">
              <LineIcon name="shield" />
              <span>Vé được bảo lưu giữ chỗ 15 phút ngay sau khi bấm Tạo đơn.</span>
            </div>
          </section>
        </div>
      }
    >
      <RequestState
        error={resource.error || error}
        loading={resource.loading}
        onRetry={resource.error ? resource.reload : undefined}
      />

      {resource.data && selection && (
        <form className="ev-checkout-form" onSubmit={submit}>
          {/* Card 1: Thông tin vé đã chọn */}
          <section className="ev-checkout-card">
            <div className="ev-card-title-row">
              <LineIcon name="ticket" />
              <h2>Chi tiết vé tham dự</h2>
            </div>

            <div className="ev-ticket-spec-grid">
              <div className="spec-item">
                <small>SỰ KIỆN</small>
                <strong>{resource.data.event.title}</strong>
              </div>
              <div className="spec-item">
                <small>HẠNG VÉ &amp; SỐ LƯỢNG</small>
                <strong>
                  {resource.data.ticket.name} × {selection.quantity} vé
                </strong>
              </div>
              <div className="spec-item">
                <small>THỜI GIAN KHAI MẠC</small>
                <span>{formatDateTime(resource.data.event.startAt)}</span>
              </div>
              <div className="spec-item">
                <small>ĐỊA ĐIỂM TỔ CHỨC</small>
                <span>{resource.data.event.location}</span>
              </div>
            </div>
          </section>

          {/* Card 2: Thông tin tài khoản nhận vé */}
          <section className="ev-checkout-card">
            <div className="ev-card-title-row">
              <LineIcon name="user" />
              <h2>Tài khoản nhận vé điện tử</h2>
            </div>
            <div className="ev-account-info-box">
              <div className="account-row">
                <span>Họ và tên người nhận:</span>
                <strong>{user?.fullName || "Chưa cập nhật tên"}</strong>
              </div>
              <div className="account-row">
                <span>Email nhận mã QR vé:</span>
                <strong>{user?.email}</strong>
              </div>
              <p className="account-note">
                Vé điện tử và mã QR check-in sẽ được liên kết trực tiếp vào tài khoản này và gửi bản sao tới email trên.
              </p>
            </div>
          </section>

          {/* Card 3: Nhập mã ưu đãi / Voucher */}
          <section className="ev-checkout-card">
            <div className="ev-card-title-row">
              <LineIcon name="sparkles" />
              <h2>Mã giảm giá / Ưu đãi</h2>
            </div>
            <div className="ev-voucher-input-row">
              <input
                disabled={busy}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã ưu đãi (nếu có)"
                value={promoCode}
              />
              <button
                className="ev-voucher-btn"
                onClick={applyPromo}
                type="button"
              >
                Áp dụng
              </button>
            </div>

            {promoMessage && (
              <p className="ev-promo-msg success">
                <LineIcon name="check" /> {promoMessage}
              </p>
            )}
            {promoError && (
              <p className="ev-promo-msg error">
                {promoError}
              </p>
            )}
          </section>

          {/* Hộp kiểm điều khoản */}
          <div className="ev-terms-agreement">
            <label>
              <input
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                type="checkbox"
              />
              <span>
                Tôi đồng ý với <strong>Điều khoản dịch vụ</strong> của EventHub, xác nhận thông tin vé đã chính xác và hiểu rõ chính sách không hoàn tiền sau khi phát hành vé.
              </span>
            </label>
          </div>

          {/* Nhóm nút hành động */}
          <div className="ev-checkout-actions">
            <button
              className="ev-checkout-submit-btn"
              disabled={busy || !agreed}
              type="submit"
            >
              <span>{busy ? "Đang tạo đơn giữ chỗ..." : "Tạo đơn giữ chỗ & Chuyển sang thanh toán"}</span>
              <LineIcon name="arrow-right" />
            </button>
            <Link
              className="ev-checkout-back-link"
              to={selection ? `/events/${selection.eventId}` : "/explore"}
            >
              ← Chọn lại loại vé khác
            </Link>
          </div>
        </form>
      )}
    </CheckoutLayout>
  );
}
