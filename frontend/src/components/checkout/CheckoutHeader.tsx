import type { MouseEvent } from "react";
import { EventHubBrand } from "../ui/EventHubBrand";
import { LineIcon } from "../ui/LineIcon";

const steps = ["Chọn vé", "Xác nhận", "Thanh toán", "Hoàn tất"];

type CheckoutHeaderProps = {
  activeStep: 2 | 3 | 4;
  secureLabel: string;
  orderInProgress?: boolean;
};

export function CheckoutHeader({ activeStep, orderInProgress = true, secureLabel }: CheckoutHeaderProps) {
  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    if (orderInProgress && !window.confirm("Bạn có muốn rời quy trình đặt vé? Thông tin đang nhập có thể không được lưu.")) {
      event.preventDefault();
    }
  }

  return (
    <header className="checkout-header">
      <div className="checkout-header-inner">
        <EventHubBrand className="checkout-brand" onClick={handleBrandClick} />
        <ol className="checkout-stepper" aria-label="Tiến trình đặt vé">
          {steps.map((label, index) => {
            const step = index + 1;
            const completed = step < activeStep;
            const active = step === activeStep;
            return (
              <li className={completed ? "is-complete" : active ? "is-active" : ""} key={label} aria-current={active ? "step" : undefined}>
                <span>{completed ? <LineIcon name="check" /> : step}</span>
                <strong>{label}</strong>
              </li>
            );
          })}
        </ol>
        <div className="checkout-secure"><LineIcon name="lock" /><span>{secureLabel}</span></div>
      </div>
    </header>
  );
}

