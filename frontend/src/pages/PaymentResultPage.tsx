import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { HoldTimer, InlineAlert } from "../components/checkout/CheckoutUi";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { ETicketCard, NextStepsList, ResultActions, ResultHero, SummaryStrip } from "../components/checkout/ResultComponents";
import { LineIcon } from "../components/ui/LineIcon";
import { mockCheckoutOrder } from "../data/mockCheckout";
import type { ResultStatus } from "../types/checkout";
import { getDevPreviewParam } from "../utils/preview";

export function PaymentResultPage() {
  const location = useLocation();
  const routeStatus = (location.state as { status?: ResultStatus } | null)?.status;
  const previewStatus = getDevPreviewParam("status") ?? routeStatus;
  const initialStatus: ResultStatus = previewStatus === "failed" || previewStatus === "processing" ? previewStatus : "success";
  const [status, setStatus] = useState<ResultStatus>(initialStatus);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.querySelector<HTMLElement>(".result-hero")?.focus();
  }, [status]);

  function checkAgain() {
    setChecking(true);
    window.setTimeout(() => { setChecking(false); setStatus("success"); }, 900);
  }

  return (
    <div className={`checkout-flow-page result-page result-page--${status}`}>
      <CheckoutHeader activeStep={status === "success" ? 4 : 3} orderInProgress={status !== "success"} secureLabel="Kết nối được mã hóa và bảo mật" />
      <main className="result-main">
        <ResultHero email={mockCheckoutOrder.recipient.email} status={status} />
        <SummaryStrip order={mockCheckoutOrder} status={status} />

        {status === "success" ? <div className="result-success-grid"><div><ETicketCard order={mockCheckoutOrder} /><ResultActions /></div><NextStepsList /></div> : null}

        {status === "failed" ? <div className="result-state-grid"><section className="result-state-card"><InlineAlert tone="warning" title="Giao dịch chưa được ngân hàng chấp nhận">Bạn chưa bị trừ tiền.</InlineAlert><div className="result-hold"><span>Đơn hàng và vé vẫn được giữ trong</span><HoldTimer initialSeconds={402} prefix="" /></div><div className="result-state-actions"><Link className="checkout-button checkout-button--primary" to="/payment">Thử thanh toán lại</Link><Link className="checkout-button checkout-button--outline" to="/payment">Chọn phương thức khác</Link><a href="#support">Liên hệ hỗ trợ</a></div><details><summary>Chi tiết kỹ thuật</summary><p>Mã tham chiếu hỗ trợ: PAY-EH-8F3K. Không phải lỗi cần thao tác từ phía bạn.</p></details></section><OrderSummary compact holdSeconds={402} order={mockCheckoutOrder} /></div> : null}

        {status === "processing" ? <div className="result-processing-card"><div className="processing-code"><span>Mã giao dịch</span><strong>TXN-8F3K-2026</strong></div><div className="processing-retry"><span>Tự động kiểm tra lại sau 5 giây</span><i><b className={checking ? "is-checking" : ""} /></i></div><button className="checkout-button checkout-button--primary" disabled={checking} onClick={checkAgain} type="button">{checking ? <><span className="button-spinner" />Đang kiểm tra…</> : <><LineIcon name="refresh" />Kiểm tra lại</>}</button><Link to="/">Về trang chủ</Link><p><LineIcon name="mail" />Kết quả cuối cùng sẽ được gửi qua email.</p></div> : null}
      </main>
    </div>
  );
}
