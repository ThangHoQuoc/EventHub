import { Link, useParams } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { QRCode } from "../components/ui/QRCode";
import { RequestState } from "../components/ui/RequestState";
import { getTicketDetailApi } from "../api/tickets";
import { useApiResource } from "../hooks/useApiResource";
import { formatDate } from "../utils/format";
import { ticketStatusLabel } from "./MyTicketsPage";

export function TicketDetailPage() {
  const {ticketId} = useParams();
  const resource = useApiResource(() => getTicketDetailApi(ticketId!), [ticketId]);
  const ticket = resource.data;
  return <CustomerLayout activeNav="tickets" title="Chi tiết vé điện tử" description="Xuất trình mã vé hoặc QR tại cổng check-in.">
    <Link to="/my-tickets">Quay lại danh sách vé</Link>
    <RequestState loading={resource.loading} error={resource.error} onRetry={resource.reload} />
    {ticket && <div className={`ev-master-ticket ${ticket.status === "VALID" ? "is-valid" : "is-used"}`}>
      <div className="ev-master-ticket-body"><span className="ev-ticket-status-pill">{ticketStatusLabel[ticket.status]}</span><h1>{ticket.eventTitle}</h1><h2>{ticket.ticketTypeName}</h2><p>Cấp lúc: {formatDate(ticket.issuedAt)}</p>{ticket.checkedInAt && <p>Check-in lúc: {formatDate(ticket.checkedInAt)}</p>}<p>Mã đơn: {ticket.bookingId}</p><Link to={`/events/${ticket.eventId}`}>Thông tin sự kiện</Link><p>Không chia sẻ QR hoặc mã vé với người khác.</p></div>
      <div className="ev-master-ticket-stub">{ticket.status === "VALID" && <div className="ev-master-qr-box"><QRCode value={ticket.qrPayload} label={`QR vé ${ticket.ticketCode}`} /></div>}
        <div className="ev-master-code-display"><small>MÃ VÉ</small><strong style={{overflowWrap:"anywhere"}}>{ticket.ticketCode}</strong></div><button className="btn btn-secondary" type="button" onClick={() => window.print()}>In vé</button><button type="button" onClick={resource.reload} disabled={resource.loading}>Cập nhật trạng thái</button>
      </div></div>}
  </CustomerLayout>;
}
