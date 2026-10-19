import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { QRCode } from "../components/ui/QRCode";
import { mockIssuedTickets } from "../data/mockCustomer";
import { formatDate } from "../utils/format";
import type { IssuedTicket } from "../types/customer";

export function MyTicketsPage() {
  const [filter, setFilter] = useState<"ALL" | "VALID" | "USED">("VALID");
  const [tickets] = useState<IssuedTicket[]>(mockIssuedTickets);

  const filteredTickets = tickets.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <CustomerLayout
      activeNav="tickets"
      description="Quản lý và xuất trình vé điện tử có mã QR để check-in tại sự kiện."
      title="Vé điện tử của tôi"
    >
      {/* Filter tabs */}
      <div className="ev-customer-filter-bar">
        <div className="ev-customer-filter-tabs">
          <button
            className={filter === "VALID" ? "is-active" : ""}
            onClick={() => setFilter("VALID")}
            type="button"
          >
            Sắp diễn ra ({tickets.filter((t) => t.status === "VALID").length})
          </button>
          <button
            className={filter === "USED" ? "is-active" : ""}
            onClick={() => setFilter("USED")}
            type="button"
          >
            Đã check-in ({tickets.filter((t) => t.status === "USED").length})
          </button>
          <button
            className={filter === "ALL" ? "is-active" : ""}
            onClick={() => setFilter("ALL")}
            type="button"
          >
            Tất cả ({tickets.length})
          </button>
        </div>
        <Link className="ev-btn-ghost-sm" to="/explore">
          <LineIcon name="search" />
          Khám phá thêm sự kiện
        </Link>
      </div>

      {/* Ticket List */}
      <div className="ev-customer-ticket-grid">
        {filteredTickets.map((ticket) => {
          const isValid = ticket.status === "VALID";
          return (
            <article
              className={`ev-customer-ticket-card ${isValid ? "is-valid" : "is-used"}`}
              key={ticket.id}
            >
              <div className="ev-ticket-card-left">
                <div className="ev-ticket-card-header">
                  <span className="ev-ticket-type-tag">{ticket.ticketTypeName}</span>
                  <span className={`ev-ticket-status-pill ${isValid ? "status-valid" : "status-used"}`}>
                    <LineIcon name={isValid ? "check" : "clock"} />
                    {isValid ? "Có hiệu lực" : "Đã check-in"}
                  </span>
                </div>

                <h3>{ticket.event.title}</h3>

                <div className="ev-ticket-info-list">
                  <p>
                    <LineIcon name="calendar" />
                    <strong>{formatDate(ticket.event.startAt)}</strong> ·{" "}
                    {new Date(ticket.event.startAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <LineIcon name="map-pin" />
                    {ticket.event.location}, {ticket.event.city}
                  </p>
                  {ticket.seatInfo && (
                    <p>
                      <LineIcon name="ticket" />
                      {ticket.seatInfo}
                    </p>
                  )}
                </div>

                <div className="ev-ticket-card-footer">
                  <div>
                    <small>Mã vé</small>
                    <code>{ticket.ticketCode}</code>
                  </div>
                  <div>
                    <small>Người sở hữu</small>
                    <strong>{ticket.holderName}</strong>
                  </div>
                </div>
              </div>

              {/* Stub / QR Section */}
              <div className="ev-ticket-card-stub">
                <div className="ev-ticket-qr-wrap">
                  <QRCode label={`Mã QR cho vé ${ticket.ticketCode}`} />
                </div>
                <small className="ev-qr-hint">
                  {isValid ? "Quét mã để vào cổng" : "Vé đã được quét"}
                </small>
                <div className="ev-ticket-stub-actions">
                  <Link
                    className="ev-ticket-btn-primary"
                    to={`/my-tickets/${ticket.id}`}
                  >
                    Xem vé lớn
                  </Link>
                  <button
                    className="ev-ticket-btn-outline"
                    onClick={() => window.print()}
                    type="button"
                  >
                    <LineIcon name="download" />
                    Tải PDF
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </CustomerLayout>
  );
}
