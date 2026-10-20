import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { getMyTicketsApi, type TicketStatus } from "../api/tickets";
import { useApiResource } from "../hooks/useApiResource";
import { formatDateTime } from "../utils/format";

export const ticketStatusLabel: Record<TicketStatus, string> = {VALID:"Có hiệu lực",USED:"Đã check-in",CANCELLED:"Đã hủy"};
export function MyTicketsPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const resource = useApiResource(() => getMyTicketsApi({page, size:10}), [page]);
  const visible = resource.data?.content.filter(ticket => filter === "ALL" || ticket.status === filter) ?? [];
  return <CustomerLayout activeNav="tickets" title="Vé điện tử của tôi" description="Vé được phát hành sau khi đơn đã được xác nhận thanh toán.">
    <div className="ev-customer-filter-bar"><label>Trạng thái trên trang này <select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">Tất cả</option><option value="VALID">Có hiệu lực</option><option value="USED">Đã check-in</option><option value="CANCELLED">Đã hủy</option></select></label><button className="btn btn-secondary" onClick={resource.reload} disabled={resource.loading}>Làm mới</button></div>
    <RequestState loading={resource.loading} error={resource.error} onRetry={resource.reload} />
    <div className="ev-customer-ticket-grid">{visible.map(ticket => <article key={ticket.id} className={`ev-customer-ticket-card ${ticket.status === "VALID" ? "is-valid" : "is-used"}`}>
      <div className="ev-ticket-card-left"><span className="ev-ticket-type-tag">{ticket.ticketTypeName}</span><h3>{ticket.eventTitle}</h3><p>{ticketStatusLabel[ticket.status]}</p><p>Cấp lúc: {formatDateTime(ticket.issuedAt)}</p><code style={{overflowWrap:"anywhere"}}>{ticket.ticketCode}</code><p><Link to={`/my-tickets/${ticket.id}`}>Mở vé và mã QR</Link></p></div>
    </article>)}</div>
    {resource.data && !visible.length && <p role="status">Chưa có vé phù hợp trên trang này.</p>}
    <PageNav page={page} totalPages={resource.data?.totalPages ?? 0} disabled={resource.loading} onChange={setPage} />
    <Link to="/my-bookings">Xem đơn hàng</Link>
  </CustomerLayout>;
}
