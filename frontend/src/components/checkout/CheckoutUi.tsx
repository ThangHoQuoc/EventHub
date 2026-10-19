import { useEffect, useState, type InputHTMLAttributes, type PropsWithChildren, type ReactNode } from "react";
import { useCountdown } from "../../hooks/useCountdown";
import { formatCurrency } from "../../utils/format";
import { LineIcon } from "../ui/LineIcon";

export function FormCard({ children, title, number, className = "" }: PropsWithChildren<{ title: string; number?: string; className?: string }>) {
  return <section className={`checkout-card ${className}`.trim()}><header className="checkout-card-heading">{number ? <span>{number}</span> : null}<h2>{title}</h2></header>{children}</section>;
}

type AlertTone = "info" | "success" | "warning" | "error";
export function InlineAlert({ children, tone = "info", title, action }: PropsWithChildren<{ tone?: AlertTone; title?: string; action?: ReactNode }>) {
  return (
    <div className={`checkout-alert checkout-alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <LineIcon name={tone === "success" ? "check" : tone === "warning" || tone === "error" ? "alert" : "info"} />
      <div>{title ? <strong>{title}</strong> : null}<span>{children}</span></div>{action}
    </div>
  );
}

export function MoneyText({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`money-text ${className}`.trim()}>{formatCurrency(value)}</span>;
}

export function HoldTimer({ initialSeconds = 600, prefix = "Vé được giữ trong", onExpire }: { initialSeconds?: number; prefix?: string; onExpire?: () => void }) {
  const { expired, label, seconds } = useCountdown(initialSeconds);
  useEffect(() => { if (expired) onExpire?.(); }, [expired, onExpire]);
  return <p className={`hold-timer ${seconds <= 120 ? "is-warning" : ""}`} aria-live={seconds === 120 || expired ? "polite" : "off"}><LineIcon name="clock" />{prefix} <strong>{label}</strong></p>;
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode; error?: string };
export function Checkbox({ error, id, label, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;
  return (
    <div className={`checkout-checkbox-wrap ${error ? "has-error" : ""}`}>
      <label className="checkout-checkbox" htmlFor={inputId}><input {...props} id={inputId} type="checkbox" /><span aria-hidden="true"><LineIcon name="check" /></span><em>{label}</em></label>
      {error ? <small role="alert">{error}</small> : null}
    </div>
  );
}

export function CopyButton({ value, label = "Sao chép" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <button className="copy-button" onClick={copy} type="button" aria-label={`${label} ${value}`}><LineIcon name={copied ? "check" : "copy"} /><span aria-live="polite">{copied ? "Đã sao chép" : label}</span></button>;
}

export function StatusBanner({ children, tone = "info", action }: PropsWithChildren<{ tone?: AlertTone; action?: ReactNode }>) {
  return <div className={`checkout-status-banner checkout-status-banner--${tone}`} role="status"><div><LineIcon name={tone === "warning" || tone === "error" ? "alert" : "info"} />{children}</div>{action}</div>;
}

