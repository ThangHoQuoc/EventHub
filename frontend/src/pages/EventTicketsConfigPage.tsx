import { useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { createTicketTypeApi, deleteTicketTypeApi, getEventApi, updateTicketTypeApi } from "../api/organizer";
import { getEventTicketTypes, type TicketTypeDto } from "../api/events";
import { useApiResource } from "../hooks/useApiResource";
import { formatCurrency } from "../utils/format";

export function EventTicketsConfigPage() {
  const {id} = useParams();
  const resource = useApiResource(async () => {
    const [event,types] = await Promise.all([getEventApi(id!),getEventTicketTypes(id!)]);return {event,types};
  }, [id]);
  const [editing,setEditing] = useState<TicketTypeDto>();
  const [busy,setBusy] = useState(false);
  const lock = useRef(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const isDraft = resource.data?.event.status === "DRAFT";
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (lock.current || !isDraft) return;
    const form = new FormData(e.currentTarget);
    const payload = {name:String(form.get("name")).trim(),description:String(form.get("description") ?? ""),price:Number(form.get("price")),quantity:Number(form.get("quantity"))};
    if (!Number.isInteger(payload.quantity) || payload.quantity < 1 || payload.price <= 0) {setError("Giá vé phải lớn hơn 0 và số lượng là số nguyên dương.");return;}
    lock.current = true;setBusy(true);setError("");setMessage("");
    try {
      if (editing) await updateTicketTypeApi(editing.id,payload); else await createTicketTypeApi(id!,payload);
      setEditing(undefined);resource.reload();setMessage("Đã lưu loại vé trên hệ thống.");
    } catch(err) {setError(err instanceof Error ? err.message : "Không thể lưu loại vé.");}
    finally {lock.current = false;setBusy(false);}
  }
  async function remove(ticket: TicketTypeDto) {
    if (lock.current || !isDraft || !window.confirm(`Xóa loại vé ${ticket.name}?`)) return;
    lock.current = true;setBusy(true);setError("");setMessage("");
    try {await deleteTicketTypeApi(ticket.id);if (editing?.id === ticket.id) setEditing(undefined);resource.reload();setMessage("Đã xóa loại vé trên hệ thống.");}
    catch(err) {setError(err instanceof Error ? err.message : "Không thể xóa loại vé.");}
    finally {lock.current = false;setBusy(false);}
  }
  return <OrganizerLayout title="Cấu hình loại vé" description="Thêm, sửa hoặc xóa loại vé khi sự kiện còn là bản nháp.">
    <RequestState loading={resource.loading} error={resource.error || error} onRetry={resource.reload} />{message && <p role="status">{message}</p>}
    {resource.data && <><div className="ev-org-event-banner"><div><h2>{resource.data.event.title}</h2><p>{resource.data.event.status}</p><p>Mã sự kiện: {id}</p></div><Link className="btn btn-primary" to={`/organizer/events/${id}/edit`}>Biên tập & Xuất bản</Link></div>
      {!isDraft && <p>Loại vé chỉ được chỉnh sửa khi sự kiện ở trạng thái DRAFT.</p>}
      <div className="ev-org-ticket-types-grid">{resource.data.types.map(ticket => <article className="ev-org-ticket-card" key={ticket.id}><h3>{ticket.name}</h3><p>{ticket.description}</p><strong>{formatCurrency(ticket.price)}</strong><div className="ev-org-ticket-metrics"><p>Tổng: {ticket.quantity}</p><p>Đã giữ/đã bán: {ticket.soldQuantity}</p><p>Còn lại: {Math.max(0,ticket.quantity-ticket.soldQuantity)}</p></div>{isDraft && <div className="ev-org-ticket-card-actions"><button disabled={busy} onClick={() => setEditing(ticket)}>Sửa</button><button disabled={busy} onClick={() => remove(ticket)}>Xóa</button></div>}</article>)}</div>
      {!resource.data.types.length && <p role="status">Chưa có loại vé.</p>}
      {isDraft && <form className="ev-org-form-card" onSubmit={save} key={editing?.id ?? "new"}><h3>{editing ? `Sửa: ${editing.name}` : "Thêm loại vé"}</h3><fieldset disabled={busy} style={{border:0,padding:0}}>
        <div className="ev-form-group"><label htmlFor="ticket-name">Tên loại vé</label><input id="ticket-name" name="name" required maxLength={100} defaultValue={editing?.name ?? ""} /></div><div className="ev-form-group"><label htmlFor="ticket-description">Mô tả</label><textarea id="ticket-description" name="description" defaultValue={editing?.description ?? ""} /></div>
        <div className="ev-form-grid-2"><div className="ev-form-group"><label htmlFor="ticket-price">Giá vé (VNĐ)</label><input id="ticket-price" name="price" required type="number" min="0.01" step="0.01" defaultValue={editing?.price ?? ""} /></div><div className="ev-form-group"><label htmlFor="ticket-quantity">Số lượng</label><input id="ticket-quantity" name="quantity" required type="number" min={1} step={1} defaultValue={editing?.quantity ?? ""} /></div></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu loại vé"}</button>{editing && <button type="button" onClick={() => setEditing(undefined)}>Hủy sửa</button>}
      </fieldset></form>}
    </>}
  </OrganizerLayout>;
}
