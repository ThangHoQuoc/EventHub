import { useMemo, useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";
import { formatCurrency } from "../../utils/format";
import { LineIcon } from "../ui/LineIcon";
import { QRCode } from "../ui/QRCode";
import { Checkbox, InlineAlert } from "./CheckoutUi";

export function QRPayPanel({ amount, expired, method, onRefresh }: { amount: number; expired?: boolean; method: "vnpay" | "momo"; onRefresh: () => void }) {
  const timer = useCountdown(expired ? 0 : 272);
  const isExpired = expired || timer.expired;
  return (
    <div className="qr-pay-panel">
      <div className={`qr-pay-code ${isExpired ? "is-expired" : ""}`}>
        <QRCode label={`Mã QR thanh toán ${method === "vnpay" ? "VNPay" : "MoMo"}`} />
        {isExpired ? <div><strong>Mã QR đã hết hạn</strong><button onClick={onRefresh} type="button"><LineIcon name="refresh" />Tạo mã mới</button></div> : null}
      </div>
      <div className="qr-pay-copy"><span>Số tiền cần thanh toán</span><strong>{formatCurrency(amount)}</strong><p>Mã có hiệu lực trong <b>{timer.label}</b></p></div>
      <ol className="qr-step-guide"><li><span>1</span><LineIcon name="phone" /><strong>Mở ứng dụng</strong></li><li><span>2</span><LineIcon name="search" /><strong>Quét mã</strong></li><li><span>3</span><LineIcon name="check" /><strong>Xác nhận thanh toán</strong></li></ol>
      {!isExpired ? <p className="payment-waiting"><i />Đang chờ thanh toán…</p> : null}
    </div>
  );
}

const banks = ["Vietcombank", "Techcombank", "MB Bank", "ACB", "BIDV", "VPBank", "Sacombank", "TPBank"];
export function BankGrid({ disabled }: { disabled?: boolean }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const filtered = useMemo(() => banks.filter((bank) => bank.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="bank-panel"><label><LineIcon name="search" /><input disabled={disabled} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm ngân hàng" value={query} /></label><div className="bank-grid">{filtered.map((bank) => <button aria-pressed={selected === bank} disabled={disabled} key={bank} onClick={() => setSelected(bank)} type="button"><span>{bank.split(" ").map((part) => part[0]).join("").slice(0, 3)}</span>{bank}</button>)}</div><p><LineIcon name="info" />Bạn sẽ được chuyển sang cổng thanh toán của ngân hàng.</p></div>;
}

export function CardForm({ disabled }: { disabled?: boolean }) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [touched, setTouched] = useState(false);
  const numberValid = number.replace(/\s/g, "").length === 16;
  return (
    <div className="card-payment-form">
      <label className={touched && !numberValid ? "has-error" : ""}><span>Số thẻ</span><div><LineIcon name="card" /><input disabled={disabled} inputMode="numeric" maxLength={19} onBlur={() => setTouched(true)} onChange={(event) => setNumber(event.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())} placeholder="1234 5678 9012 3456" value={number} /></div>{touched && !numberValid ? <small>Số thẻ không hợp lệ</small> : null}</label>
      <label><span>Tên chủ thẻ</span><input disabled={disabled} onChange={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} placeholder="NGUYEN MINH ANH" /></label>
      <label><span>Ngày hết hạn</span><input disabled={disabled} inputMode="numeric" maxLength={5} onChange={(event) => { const digits = event.currentTarget.value.replace(/\D/g, "").slice(0, 4); setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }} placeholder="MM/YY" value={expiry} /></label>
      <label><span>CVV <button aria-label="CVV là ba chữ số ở mặt sau thẻ" title="Ba chữ số ở mặt sau thẻ" type="button"><LineIcon name="info" /></button></span><input disabled={disabled} inputMode="numeric" maxLength={3} placeholder="•••" type="password" /></label>
      <p><LineIcon name="lock" />EventHub không lưu thông tin thẻ của bạn.</p>
    </div>
  );
}

export function InvoiceAccordion({ defaultOpen = false, defaultRequired = false, disabled }: { defaultOpen?: boolean; defaultRequired?: boolean; disabled?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [required, setRequired] = useState(defaultRequired);
  return (
    <section className="invoice-accordion" id="invoice-details">
      <button aria-expanded={open} onClick={() => setOpen((current) => !current)} type="button"><span><LineIcon name="building" />Thông tin hóa đơn</span><small>Không bắt buộc</small><LineIcon name="chevron-down" /></button>
      {open ? <div className="invoice-accordion-body"><Checkbox checked={required} disabled={disabled} label="Tôi cần xuất hóa đơn" name="invoice" onChange={(event) => setRequired(event.target.checked)} />{required ? <div className="invoice-fields"><label><span>Tên công ty</span><input disabled={disabled} /></label><label><span>Mã số thuế</span><input disabled={disabled} inputMode="numeric" placeholder="10 hoặc 13 chữ số" /></label><label><span>Email nhận hóa đơn</span><input disabled={disabled} type="email" /></label><label><span>Địa chỉ công ty</span><input disabled={disabled} /></label></div> : <InlineAlert>Chỉ cần điền khi bạn muốn nhận hóa đơn doanh nghiệp.</InlineAlert>}</div> : null}
    </section>
  );
}
