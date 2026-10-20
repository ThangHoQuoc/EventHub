import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { Checkbox, FormCard, InlineAlert } from "../components/checkout/CheckoutUi";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { TermsModal } from "../components/checkout/TermsModal";
import { TicketLineItem } from "../components/checkout/TicketLineItem";
import { PrimaryButton } from "../components/auth/AuthActions";
import { TextField } from "../components/auth/AuthFields";
import { LineIcon } from "../components/ui/LineIcon";
import { mockCheckoutOrder } from "../data/mockCheckout";
import type { CheckoutOrder, Recipient } from "../types/checkout";
import { getDevPreviewParam } from "../utils/preview";
import { useAuth } from "../context/AuthContext";
import { createBookingApi } from "../api/booking";

type FieldErrors = Partial<Record<keyof Recipient, string>>;
type PromoState = "idle" | "loading" | "valid" | "invalid";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const preview = getDevPreviewParam("state");

  const [order, setOrder] = useState<CheckoutOrder>(() => ({
    ...mockCheckoutOrder,
    tickets: mockCheckoutOrder.tickets.map((ticket, index) => ({
      ...ticket,
      soldOut: preview === "sold-out" && index === 0,
    })),
  }));

  const [recipient, setRecipient] = useState<Recipient>(() => ({
    fullName: user?.fullName || (preview === "errors" ? "" : order.recipient.fullName),
    email: user?.email || (preview === "errors" ? "sai-email" : order.recipient.email),
    phone: user?.phone || (preview === "errors" ? "123" : order.recipient.phone),
  }));

  const [errors, setErrors] = useState<FieldErrors>(
    preview === "errors" ? { fullName: "Vui lòng nhập họ và tên", email: "Email không hợp lệ", phone: "Số điện thoại không hợp lệ" } : {}
  );
  const [useAccount, setUseAccount] = useState(preview !== "errors");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [expired, setExpired] = useState(preview === "expired");
  const [redirecting, setRedirecting] = useState(preview === "redirecting");
  const [apiError, setApiError] = useState("");
  const [promo, setPromo] = useState(preview === "promo-invalid" ? "HETHAN" : order.promoCode ?? "");
  const [promoState, setPromoState] = useState<PromoState>(preview === "promo-invalid" ? "invalid" : order.promoCode ? "valid" : "idle");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && useAccount) {
      setRecipient({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "0912345678",
      });
    }
  }, [user, useAccount]);

  const hasSoldOutTicket = order.tickets.some((ticket) => ticket.soldOut);
  const isEmpty = preview === "empty" || order.tickets.length === 0;
  const isFormValid = recipient.fullName.trim().length > 1 && /^\S+@\S+\.\S+$/.test(recipient.email) && /^(0|\+84)[0-9\s]{8,12}$/.test(recipient.phone);

  const summaryOrder = useMemo(() => ({ ...order, recipient, discount: promoState === "valid" ? 50000 : 0 }), [order, promoState, recipient]);

  function updateRecipient(field: keyof Recipient, value: string) {
    setRecipient((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!recipient.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ và tên";
    if (!/^\S+@\S+\.\S+$/.test(recipient.email)) nextErrors.email = "Email không hợp lệ";
    if (!/^(0|\+84)[0-9\s]{8,12}$/.test(recipient.phone)) nextErrors.phone = "Số điện thoại không hợp lệ";
    setErrors(nextErrors);
    if (!termsAccepted) setTermsError("Vui lòng đồng ý điều khoản để tiếp tục.");
    if (Object.keys(nextErrors).length) firstFieldRef.current?.focus();
    return Object.keys(nextErrors).length === 0 && termsAccepted;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate() || hasSoldOutTicket || expired) return;

    if (!user) {
      setApiError("Vui lòng đăng nhập tài khoản để hoàn tất giữ chỗ và nhận vé điện tử.");
      window.setTimeout(() => navigate("/login"), 1500);
      return;
    }

    setApiError("");
    setRedirecting(true);

    try {
      // Lấy ticketTypeId từ location state hoặc fallback
      const stateTicketTypeId = location.state?.ticketTypeId || "tt-indie-ga";
      const stateQuantity = location.state?.quantity || order.tickets[0]?.quantity || 1;

      const bookingResult = await createBookingApi({
        items: [
          {
            ticketTypeId: stateTicketTypeId,
            quantity: stateQuantity,
          },
        ],
      });

      // Thành công: chuyển tiếp sang trang thanh toán kèm thông tin booking thật
      navigate("/payment?method=vnpay", {
        state: {
          booking: bookingResult,
          eventId: location.state?.eventId,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tạo đơn giữ chỗ. Vé có thể đã hết hoặc không khả dụng.";
      setApiError(msg);
      setRedirecting(false);
    }
  }

  function applyPromo() {
    setPromoState("loading");
    window.setTimeout(() => setPromoState(promo.trim().toUpperCase() === "EVENTHUB50" ? "valid" : "invalid"), 450);
  }

  if (isEmpty) {
    return <div className="checkout-flow-page"><CheckoutHeader activeStep={2} orderInProgress={false} secureLabel="Thanh toán an toàn" /><div className="checkout-empty"><div className="checkout-empty-ticket"><LineIcon name="ticket" /><i /><i /></div><h1>Giỏ vé của bạn đang trống</h1><p>Khám phá một sự kiện phù hợp rồi quay lại đây để hoàn tất đặt vé.</p><div><Link className="checkout-button checkout-button--primary" to="/explore">Khám phá sự kiện</Link><Link className="checkout-button checkout-button--outline" to="/eventmatch">Thử EventMatch</Link></div></div></div>;
  }

  const ctaDisabled = !isFormValid || !termsAccepted || hasSoldOutTicket || expired || redirecting;
  return (
    <CheckoutLayout
      activeStep={2}
      aside={<OrderSummary onHoldExpire={() => setExpired(true)} order={summaryOrder} footer={<PrimaryButton className="checkout-primary" disabled={ctaDisabled} form="checkout-form" loading={redirecting} type="submit">{redirecting ? "Đang chuyển sang thanh toán…" : "Tiếp tục thanh toán"}</PrimaryButton>} />}
      description="Kiểm tra lại vé và thông tin người nhận trước khi thanh toán."
      eyebrow="Bước 2 · Xác nhận"
      secureLabel="Thanh toán an toàn"
      title="Xác nhận đơn hàng"
      topBanner={hasSoldOutTicket ? <div className="checkout-global-alert"><InlineAlert tone="warning" title="Số lượng vé vừa thay đổi">Một hạng vé trong đơn đã hết. Vui lòng chọn lại trước khi tiếp tục.</InlineAlert></div> : null}
    >
      {apiError ? (
        <div style={{ marginBottom: 16 }}>
          <InlineAlert tone="error" title="Lỗi đặt chỗ">
            {apiError}
          </InlineAlert>
        </div>
      ) : null}
      {Object.keys(errors).length ? <InlineAlert tone="error" title="Vui lòng kiểm tra lại thông tin">Một số thông tin chưa đúng. Chúng tôi đã đánh dấu để bạn sửa nhanh.</InlineAlert> : null}
      <form id="checkout-form" onSubmit={submit} noValidate>
        <FormCard number="01" title="Thông tin người nhận vé">
          <Checkbox checked={useAccount} label="Sử dụng thông tin tài khoản của tôi" name="useAccount" onChange={(event) => { setUseAccount(event.target.checked); if (event.target.checked) setRecipient(order.recipient); }} />
          <div className="recipient-grid">
            <TextField autoComplete="name" disabled={useAccount || redirecting} error={errors.fullName} icon="user" label="Họ và tên" name="fullName" onChange={(event) => updateRecipient("fullName", event.target.value)} ref={firstFieldRef} value={recipient.fullName} />
            <TextField autoComplete="email" disabled={useAccount || redirecting} error={errors.email} icon="mail" label="Email nhận vé" name="email" onChange={(event) => updateRecipient("email", event.target.value)} type="email" value={recipient.email} />
            <TextField autoComplete="tel" disabled={useAccount || redirecting} error={errors.phone} icon="phone" label="Số điện thoại" name="phone" onChange={(event) => updateRecipient("phone", event.target.value)} value={recipient.phone} />
          </div>
          <p className="checkout-helper"><LineIcon name="info" />Vé điện tử và thông báo thay đổi sẽ được gửi tới email này.</p>
        </FormCard>

        <FormCard number="02" title="Vé đã chọn">
          <div className="checkout-ticket-list">{order.tickets.map((ticket) => <TicketLineItem disabled={redirecting} key={ticket.id} ticket={ticket} onChange={(quantity) => setOrder((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === ticket.id ? { ...item, quantity } : item) }))} onRemove={() => setOrder((current) => ({ ...current, tickets: current.tickets.filter((item) => item.id !== ticket.id) }))} />)}</div>
        </FormCard>

        <FormCard number="03" title="Mã ưu đãi">
          <div className={`promo-field ${promoState === "invalid" ? "has-error" : ""}`}><label htmlFor="promo">Mã ưu đãi</label><div><input disabled={redirecting || promoState === "valid"} id="promo" onChange={(event) => { setPromo(event.target.value); setPromoState("idle"); }} placeholder="Nhập mã ưu đãi" value={promo} /><button disabled={!promo.trim() || promoState === "loading" || promoState === "valid"} onClick={applyPromo} type="button">{promoState === "loading" ? "Đang kiểm tra…" : "Áp dụng"}</button></div></div>
          {promoState === "valid" ? <InlineAlert action={<button className="alert-link" onClick={() => { setPromo(""); setPromoState("idle"); }} type="button">Gỡ mã</button>} tone="success">Đã áp dụng mã EVENTHUB50 — giảm 50.000đ</InlineAlert> : null}
          {promoState === "invalid" ? <p className="promo-error" role="alert">Mã ưu đãi không hợp lệ hoặc đã hết hạn.</p> : null}
        </FormCard>

        <FormCard number="04" title="Điều khoản mua vé">
          <Checkbox checked={termsAccepted} error={termsError} label={<>Tôi đồng ý với <button onClick={() => setTermsOpen(true)} type="button">Điều khoản mua vé</button> và <button onClick={() => setTermsOpen(true)} type="button">Chính sách hoàn tiền</button>.</>} name="terms" onChange={(event) => { setTermsAccepted(event.target.checked); setTermsError(""); }} />
        </FormCard>
      </form>
      {expired ? <div className="checkout-expired" role="alertdialog" aria-modal="true"><div><LineIcon name="clock" /><h2>Đã hết thời gian giữ vé</h2><p>Chúng tôi đã trả vé về hệ thống để đảm bảo công bằng cho mọi người.</p><Link className="checkout-button checkout-button--primary" to="/events/vietnam-tech-meetup-2026">Chọn lại vé</Link><Link className="checkout-button checkout-button--text" to="/events/vietnam-tech-meetup-2026">Về trang sự kiện</Link></div></div> : null}
      <TermsModal onClose={() => setTermsOpen(false)} open={termsOpen} />
    </CheckoutLayout>
  );
}
