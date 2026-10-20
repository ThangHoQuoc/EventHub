import { useRef, useState, type FormEvent } from "react";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { checkInTicketApi } from "../api/organizer";
import type { TicketDto } from "../api/tickets";
import { formatDate } from "../utils/format";

export function CheckInStationPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"ticketCode" | "qrPayload">("ticketCode");
  const [records, setRecords] = useState<TicketDto[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (lock.current || !input.trim()) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const ticket = await checkInTicketApi({[mode]:input.trim()});
      setRecords(current => [ticket,...current].slice(0,30)); setInput("");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể check-in. Kiểm tra lại trạng thái trước khi thử lại."); }
    finally {lock.current = false; setBusy(false);}
  }
  return <OrganizerLayout activeNav="checkin" title="Trạm soát vé" description="Nhập mã vé hoặc payload từ thiết bị đọc QR. Backend kiểm tra quyền và trạng thái vé.">
    <div className="ev-checkin-station-grid"><section className="ev-checkin-scanner-card">
      <form className="ev-manual-checkin-form" onSubmit={submit}><label>Loại dữ liệu <select value={mode} disabled={busy} onChange={e => setMode(e.target.value as typeof mode)}><option value="ticketCode">Mã vé</option><option value="qrPayload">QR payload</option></select></label>
        <label htmlFor="ticketCodeInput">{mode === "ticketCode" ? "Mã vé" : "QR payload"}</label><div className="ev-manual-input-row"><input id="ticketCodeInput" required autoComplete="off" value={input} disabled={busy} onChange={e => setInput(e.target.value)} /><button className="btn btn-primary" disabled={busy || !input.trim()}>{busy ? "Đang kiểm tra…" : "Check-in"}</button></div>
        <p>Giữ nguyên chữ hoa/thường của mã. Quét trực tiếp bằng camera chưa khả dụng.</p></form><RequestState error={error} />
    </section><section className="ev-checkin-log-card"><h2>Kết quả trong phiên này</h2><p>Hiển thị tối đa 30 lượt thành công gần nhất trong phiên; đây chưa phải lịch sử toàn hệ thống.</p>
      {records.map(ticket => <article className="ev-checkin-log-item is-success" key={`${ticket.id}-${ticket.checkedInAt}`} role="status"><div><strong>Check-in thành công · {ticket.eventTitle}</strong><p>{ticket.ticketTypeName} · {ticket.ticketCode}</p><p>{ticket.checkedInAt && formatDate(ticket.checkedInAt)}</p></div></article>)}
      {!records.length && <p>Chưa có lượt check-in thành công trong phiên này.</p>}
    </section></div>
  </OrganizerLayout>;
}
