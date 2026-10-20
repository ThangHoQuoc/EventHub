import type { KeyboardEvent, ReactNode } from "react";
import type { PaymentMethod } from "../../types/checkout";
import { LineIcon, type LineIconName } from "../ui/LineIcon";

const methods: Array<{ id: PaymentMethod; title: string; description: string; badge?: string; mark: string; icon: LineIconName }> = [
  { id: "vnpay", title: "VNPay", description: "Thanh toán bằng QR hoặc ứng dụng ngân hàng", badge: "Phổ biến", mark: "VN", icon: "bank" },
  { id: "momo", title: "MoMo", description: "Thanh toán qua ứng dụng MoMo", mark: "M", icon: "phone" },
  { id: "atm", title: "Thẻ ATM nội địa", description: "Chọn ngân hàng hoặc chuyển sang cổng thanh toán", mark: "ATM", icon: "bank" },
  { id: "card", title: "Thẻ quốc tế", description: "Visa / Mastercard", mark: "V/M", icon: "card" },
];

type PaymentMethodGroupProps = {
  value: PaymentMethod | "";
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  renderDetails: (method: PaymentMethod) => ReactNode;
};

export function PaymentMethodGroup({ disabled, onChange, renderDetails, value }: PaymentMethodGroupProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = Math.max(0, methods.findIndex((method) => method.id === value));
    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const next = methods[(currentIndex + direction + methods.length) % methods.length];
    onChange(next.id);
    document.getElementById(`payment-${next.id}`)?.focus();
  }

  return (
    <div className="payment-method-group" onKeyDown={handleKeyDown} role="radiogroup" aria-label="Phương thức thanh toán">
      {methods.map((method) => {
        const selected = value === method.id;
        return <div className={`payment-method ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`} key={method.id}>
          <button aria-checked={selected} aria-disabled={disabled} className="payment-method-button" id={`payment-${method.id}`} onClick={() => !disabled && onChange(method.id)} role="radio" tabIndex={selected || (!value && method.id === "vnpay") ? 0 : -1} type="button">
            <span className={`payment-brand payment-brand--${method.id}`}>{method.mark}</span><span className="payment-method-copy"><strong>{method.title}{method.badge ? <em>{method.badge}</em> : null}</strong><small>{method.description}</small></span><span className="payment-method-radio">{selected ? <LineIcon name="check" /> : null}</span><LineIcon className="payment-method-icon" name={method.icon} />
          </button>
          {selected ? <div className="payment-method-details">{renderDetails(method.id)}</div> : null}
        </div>;
      })}
    </div>
  );
}

