import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckoutLayout } from "../components/checkout/CheckoutLayout";
import { FormCard, InlineAlert, StatusBanner } from "../components/checkout/CheckoutUi";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { BankGrid, CardForm, InvoiceAccordion, QRPayPanel } from "../components/checkout/PaymentPanels";
import { PaymentMethodGroup } from "../components/checkout/PaymentMethodGroup";
import { PrimaryButton } from "../components/auth/AuthActions";
import { LineIcon } from "../components/ui/LineIcon";
import { mockCheckoutOrder } from "../data/mockCheckout";
import type { PaymentMethod } from "../types/checkout";
import { formatCurrency } from "../utils/format";
import { getDevPreviewParam } from "../utils/preview";

type PaymentState = "idle" | "creating" | "waiting" | "verifying" | "qr-expired" | "declined" | "offline" | "unknown";

export function PaymentPage() {
  const navigate = useNavigate();
  const preview = getDevPreviewParam("state") as PaymentState | null;
  const previewInvoice = getDevPreviewParam("invoice");
  const methodParam = getDevPreviewParam("method") ?? new URLSearchParams(window.location.search).get("method");
  const initialMethod = (["vnpay", "momo", "atm", "card"] as string[]).includes(methodParam ?? "") ? methodParam as PaymentMethod : "";
  const [method, setMethod] = useState<PaymentMethod | "">(initialMethod);
  const [state, setState] = useState<PaymentState>(preview ?? "idle");
  const total = useMemo(() => mockCheckoutOrder.tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0) + mockCheckoutOrder.serviceFee - mockCheckoutOrder.discount, []);
  const processing = state === "creating" || state === "waiting" || state === "verifying";

  useEffect(() => {
    if (!processing) return;
    const preventLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventLeave);
    return () => window.removeEventListener("beforeunload", preventLeave);
  }, [processing]);

  function startPayment() {
    if (!method || processing) return;
    setState("creating");
    window.setTimeout(() => {
      if (method === "vnpay" || method === "momo") setState("waiting");
      else navigate("/payment/result", { state: { status: "processing" } });
    }, 700);
  }

  function renderDetails(selected: PaymentMethod) {
    if (selected === "vnpay" || selected === "momo") return <QRPayPanel amount={total} expired={state === "qr-expired"} method={selected} onRefresh={() => setState("waiting")} />;
    if (selected === "atm") return <BankGrid disabled={processing} />;
    return <CardForm disabled={processing} />;
  }

  const topBanner = state === "offline" ? <StatusBanner action={<button onClick={() => setState("idle")} type="button"><LineIcon name="refresh" />Thử lại</button>} tone="warning">Mất kết nối. Đang thử kết nối lại…</StatusBanner> : processing ? <StatusBanner>Giao dịch đang được xử lý. Vui lòng không đóng trang.</StatusBanner> : undefined;

  return (
    <CheckoutLayout
      activeStep={3}
      aside={<OrderSummary compact order={mockCheckoutOrder} footer={<><PrimaryButton className="checkout-primary" disabled={!method || processing || state === "unknown"} loading={state === "creating"} onClick={startPayment} type="button">{state === "creating" ? "Đang tạo giao dịch…" : `Thanh toán ${formatCurrency(total)}`}</PrimaryButton>{!method ? <p className="payment-cta-hint">Chọn một phương thức để tiếp tục</p> : null}</>} />}
      description="Chọn cách thanh toán phù hợp. Thông tin giao dịch luôn được mã hóa."
      eyebrow="Bước 3 · Thanh toán"
      secureLabel="Kết nối được mã hóa và bảo mật"
      title="Thanh toán"
      topBanner={topBanner}
    >
      {state === "declined" ? <InlineAlert action={<button className="alert-link" onClick={() => setState("idle")} type="button">Thử lại</button>} tone="warning" title="Ngân hàng đã từ chối giao dịch">Thử phương thức khác hoặc liên hệ ngân hàng của bạn.</InlineAlert> : null}
      {state === "unknown" ? <InlineAlert action={<button className="alert-link" onClick={() => setState("verifying")} type="button">Kiểm tra lại</button>} title="Chúng tôi chưa nhận được kết quả cuối cùng">Bạn không cần thanh toán lại. Chúng tôi sẽ tiếp tục kiểm tra giao dịch.</InlineAlert> : null}
      {state === "verifying" ? <div className="payment-verifying" role="status"><div><i /><span>Đang xác minh kết quả…</span></div><p>Ngân hàng có thể phản hồi chậm hơn bình thường. Bạn không cần thao tác lại.</p></div> : null}
      <FormCard number="01" title="Phương thức thanh toán">
        <PaymentMethodGroup disabled={processing} onChange={(value) => { setMethod(value); if (["declined", "unknown", "qr-expired"].includes(state)) setState("idle"); }} renderDetails={renderDetails} value={method} />
      </FormCard>
      <InvoiceAccordion defaultOpen={previewInvoice === "open" || previewInvoice === "required"} defaultRequired={previewInvoice === "required"} disabled={processing} />
    </CheckoutLayout>
  );
}
