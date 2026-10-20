import { useRef, useState, type FormEvent } from "react";
import { confirmPaymentApi, type PaymentDto } from "../api/payments";
import { RequestState } from "../components/ui/RequestState";
import { formatCurrency } from "../utils/format";

export function AdminPaymentPage() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentDto>();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    const form = new FormData(e.currentTarget);
    if (!window.confirm("Xác nhận đã đối chiếu thanh toán thực tế cho đúng mã đơn và mã giao dịch?")) return;
    lock.current = true; setBusy(true); setError(""); setPayment(undefined);
    try {
      setPayment(await confirmPaymentApi({bookingId: String(form.get("bookingId")).trim(), provider: String(form.get("provider")).trim(), providerTransactionId: String(form.get("reference")).trim()}));
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể xác nhận thanh toán."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <main className="result-main"><h1>Xác nhận thanh toán · ADMIN</h1><p>Chỉ xác nhận sau khi đã đối chiếu giao dịch thực tế. Số tiền được tính từ đơn. Danh sách đơn chờ chưa khả dụng; nhập mã đơn đã đối chiếu.</p>
    <form className="checkout-form-card" onSubmit={submit}><label>Mã đơn<input required name="bookingId" disabled={busy} /></label><label>Đơn vị thanh toán<input required name="provider" placeholder="Ví dụ: MANUAL" disabled={busy} /></label><label>Mã giao dịch đã đối chiếu<input required name="reference" disabled={busy} /></label><button className="btn btn-primary" disabled={busy}>{busy ? "Đang xác nhận…" : "Xác nhận thanh toán"}</button></form>
    <RequestState error={error} />
    {payment && <section className="checkout-form-card" role="status"><h2>Kết quả từ hệ thống</h2><p>Mã đơn: {payment.bookingId}</p><p>Số tiền: {formatCurrency(payment.amount)}</p><p>Thanh toán: {payment.status} · Đơn: {payment.bookingStatus}</p><p>Mã giao dịch: {payment.providerTransactionId}</p></section>}
  </main>;
}
