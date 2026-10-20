import { useRef, useState, type FormEvent } from "react";
import type { EventDto } from "../../api/events";
import type { CreateEventPayload } from "../../api/organizer";
import { RequestState } from "../ui/RequestState";
import { toLocalDateTime } from "../../utils/organizerState";

type Props = { initial?: EventDto; onSave: (payload: CreateEventPayload) => Promise<void>; onDirty?: () => void; disabled?: boolean };
export function EventForm({initial,onSave,onDirty,disabled}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const isDraft = !initial || initial.status === "DRAFT";
  const closed = initial?.status === "CANCELLED" || initial?.status === "COMPLETED";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (lock.current || closed) return;
    const form = new FormData(e.currentTarget);
    setError("");
    const start = isDraft ? new Date(String(form.get("startAt"))) : new Date(initial!.startAt);
    const end = isDraft ? new Date(String(form.get("endAt"))) : new Date(initial!.endAt);
    if (isDraft && (!Number.isFinite(start.getTime()) || start <= new Date() || end <= start)) { setError("Chọn thời gian trong tương lai và thời gian kết thúc sau thời gian bắt đầu."); return; }
    lock.current = true; setBusy(true);
    try { await onSave({title:String(form.get("title")).trim(),description:String(form.get("description")).trim(),location:String(form.get("location")).trim(),category:isDraft ? String(form.get("category") ?? "") : initial?.category,thumbnailUrl:isDraft ? String(form.get("thumbnailUrl") ?? "") : initial?.thumbnailUrl,startAt:start.toISOString(),endAt:end.toISOString()}); }
    catch (err) {setError(err instanceof Error ? err.message : "Chưa thể lưu sự kiện.");}
    finally {lock.current = false; setBusy(false);}
  }
  return <form className="ev-org-form-card" onSubmit={submit} onChange={onDirty}>
    <RequestState error={error} /><fieldset disabled={busy || disabled || closed} style={{border:0,padding:0,margin:0}}>
    <div className="ev-form-group"><label htmlFor="event-title">Tên sự kiện</label><input id="event-title" name="title" required maxLength={255} defaultValue={initial?.title ?? ""} /></div>
    <div className="ev-form-group"><label htmlFor="event-description">Mô tả</label><textarea id="event-description" name="description" required rows={5} defaultValue={initial?.description ?? ""} /></div>
    <div className="ev-form-group"><label htmlFor="event-location">Địa điểm (gồm thành phố)</label><input id="event-location" name="location" required defaultValue={initial?.location ?? ""} /></div>
    {isDraft && <><div className="ev-form-group"><label htmlFor="event-category">Danh mục</label><input id="event-category" name="category" defaultValue={initial?.category ?? ""} /></div>
      <div className="ev-form-group"><label htmlFor="event-thumbnail">Ảnh bìa (URL)</label><input id="event-thumbnail" type="url" name="thumbnailUrl" defaultValue={initial?.thumbnailUrl ?? ""} /></div>
      <div className="ev-form-grid-2"><div className="ev-form-group"><label htmlFor="event-start">Bắt đầu (giờ địa phương)</label><input id="event-start" type="datetime-local" name="startAt" required defaultValue={toLocalDateTime(initial?.startAt)} /></div><div className="ev-form-group"><label htmlFor="event-end">Kết thúc (giờ địa phương)</label><input id="event-end" type="datetime-local" name="endAt" required defaultValue={toLocalDateTime(initial?.endAt)} /></div></div>
    </>}
    {!closed && <button className="ev-btn-primary" type="submit" disabled={busy}>{busy ? "Đang lưu…" : initial ? "Lưu cập nhật" : "Tạo bản nháp & Cấu hình vé"}</button>}
    </fieldset>
  </form>;
}
