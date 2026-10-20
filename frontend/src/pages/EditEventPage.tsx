import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { EventForm } from "../components/organizer/EventForm";
import { RequestState } from "../components/ui/RequestState";
import { cancelEventApi, getEventApi, publishEventApi, updateEventApi } from "../api/organizer";
import { useApiResource } from "../hooks/useApiResource";
import { eventUpdatePayload, rememberEvent } from "../utils/organizerState";
import { useAuth } from "../context/AuthContext";

export function EditEventPage() {
  const {id} = useParams();
  const {user} = useAuth();
  const resource = useApiResource(() => getEventApi(id!), [id]);
  const event = resource.data;
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function transition(action: "publish" | "cancel") {
    if (!event || lock.current || dirty || !window.confirm(action === "publish" ? "Xuất bản phiên bản đã lưu của sự kiện?" : "Hủy sự kiện này? Thao tác không thể hoàn tác qua ứng dụng.")) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try {resource.setData(await (action === "publish" ? publishEventApi(event.id) : cancelEventApi(event.id)));setMessage("Trạng thái đã được cập nhật từ hệ thống.");}
    catch(err) {setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");}
    finally {lock.current = false;setBusy(false);}
  }
  return <OrganizerLayout title="Biên tập & Quản lý sự kiện" description="Nội dung và trạng thái được tải bằng API quản lý sự kiện.">
    <Link to="/organizer">Về quản lý sự kiện</Link><RequestState loading={resource.loading} error={resource.error || error} onRetry={resource.reload} />{message && <p role="status">{message}</p>}
    {event && <div className="ev-org-edit-grid"><EventForm key={`${event.id}:${event.updatedAt}:${event.status}`} initial={event} disabled={busy} onDirty={() => setDirty(true)} onSave={async payload => {
      const updated = await updateEventApi(event.id,eventUpdatePayload(event,payload));
      resource.setData(updated);setDirty(false);setMessage("Đã lưu cập nhật trên hệ thống.");rememberEvent(user!.id,event.id);
    }} /><aside className="ev-org-lifecycle-card"><h3>{event.title}</h3><p>Mã: {event.id}</p><p>Trạng thái: <strong>{event.status}</strong></p><Link to={`/organizer/events/${event.id}/tickets`}>Cấu hình loại vé</Link>
      {event.status === "PUBLISHED" && <><p>Chỉ sửa tiêu đề, mô tả và địa điểm khi đã công bố.</p><Link to={`/events/${event.id}`}>Xem trang công khai</Link></>}
      {dirty && <p>Lưu thay đổi trước khi chuyển trạng thái.</p>}
      <div className="ev-org-lifecycle-buttons">{event.status === "DRAFT" && <button className="btn btn-primary" disabled={busy || dirty} onClick={() => transition("publish")}>Xuất bản</button>}
      {(event.status === "DRAFT" || event.status === "PUBLISHED") && <button className="btn btn-secondary" disabled={busy || dirty} onClick={() => transition("cancel")}>Hủy sự kiện</button>}</div>
    </aside></div>}
  </OrganizerLayout>;
}
