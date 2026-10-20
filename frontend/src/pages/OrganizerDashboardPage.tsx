import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { searchEventsApi } from "../api/organizer";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../context/AuthContext";
import { recentEvents } from "../utils/organizerState";
import { formatDate } from "../utils/format";

export function OrganizerDashboardPage() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState("");
  const resource = useApiResource(() => searchEventsApi(page,keyword), [page,keyword]);
  const visible = resource.data?.content.filter(event => user?.role === "ADMIN" || event.organizerId === user?.id) ?? [];
  function openEvent(e: FormEvent) {e.preventDefault(); if (eventId.trim()) navigate(`/organizer/events/${encodeURIComponent(eventId.trim())}/edit`);}
  return <OrganizerLayout title="Quản lý sự kiện" description="Mở sự kiện để biên tập nội dung, cấu hình vé và quản lý trạng thái.">
    <section className="ev-org-form-card"><h3>Mở sự kiện bằng mã ID</h3><form onSubmit={openEvent} className="ev-manual-input-row"><label htmlFor="open-event-id">Mã sự kiện</label><input id="open-event-id" required value={eventId} onChange={e => setEventId(e.target.value)} /><button className="btn btn-primary">Mở quản lý</button></form>
      <p>Backend hiện chưa có API liệt kê đầy đủ bản nháp theo nhà tổ chức. Hãy giữ đường dẫn hoặc ID của sự kiện.</p>
      {recentEvents(user!.id).length > 0 && <><h4>Mã sự kiện đã lưu trên trình duyệt của tài khoản này</h4><ul>{recentEvents(user!.id).map(id => <li key={id}><Link to={`/organizer/events/${encodeURIComponent(id)}/edit`}>{id}</Link></li>)}</ul></>}
    </section>
    <section><h3>Sự kiện đã công bố {user?.role !== "ADMIN" && "của bạn trên trang này"}</h3><form onSubmit={e => {e.preventDefault();setKeyword(query);setPage(0);}} className="ev-manual-input-row"><label htmlFor="event-keyword">Tìm nội dung sự kiện</label><input id="event-keyword" value={query} onChange={e => setQuery(e.target.value)} /><button className="btn btn-secondary">Tìm kiếm</button></form>
      <p>API phân trang các sự kiện công khai; bộ lọc chủ sở hữu áp dụng trong trang. Trang có thể trống dù các trang khác có sự kiện của bạn.</p>
      <RequestState loading={resource.loading} error={resource.error} onRetry={resource.reload} />
      <div className="ev-org-ticket-types-grid">{visible.map(event => <article className="ev-org-ticket-card" key={event.id}><h3>{event.title}</h3><p>{event.status} · {formatDate(event.startAt)}</p><p>{event.location}</p><Link className="btn btn-secondary" to={`/organizer/events/${event.id}/edit`}>Biên tập</Link> <Link to={`/organizer/events/${event.id}/tickets`}>Loại vé</Link></article>)}</div>
      {resource.data && !visible.length && <p role="status">Chưa có sự kiện phù hợp trên trang này.</p>}
      <PageNav page={page} totalPages={resource.data?.totalPages ?? 0} onChange={setPage} disabled={resource.loading} />
    </section>
  </OrganizerLayout>;
}
