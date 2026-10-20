import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockOrganizerEvents } from "../data/mockOrganizer";
import { formatCurrency } from "../utils/format";
import type { TicketType } from "../types/ticket";

export function EventTicketsConfigPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockOrganizerEvents.find((e) => e.id === id) ?? mockOrganizerEvents[3]; // mặc định lấy draft

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(event.ticketTypes);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form new ticket state
  const [name, setName] = useState("");
  const [price, setPrice] = useState(150000);
  const [quantity, setQuantity] = useState(50);
  const [description, setDescription] = useState("");

  const isDraft = event.status === "DRAFT";

  function handleAddTicket(e: React.FormEvent) {
    e.preventDefault();
    const newTicket: TicketType = {
      id: `tt-${Date.now()}`,
      eventId: event.id,
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      soldQuantity: 0,
      availableQuantity: Number(quantity),
      status: "AVAILABLE",
    };
    setTicketTypes([...ticketTypes, newTicket]);
    setShowAddModal(false);
    setName("");
    setDescription("");
  }

  function handleDeleteTicket(ticketId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hạng vé này?")) return;
    setTicketTypes(ticketTypes.filter((t) => t.id !== ticketId));
  }

  return (
    <OrganizerLayout
      activeNav="dashboard"
      description={`Cấu hình các hạng vé cho sự kiện: ${event.title}.`}
      title="Cấu hình loại vé (Ticket Types)"
    >
      <div className="ev-org-tickets-config-shell">
        <div className="ev-ticket-detail-back">
          <Link to="/organizer/dashboard">
            <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>
              <LineIcon name="arrow-right" />
            </span>
            Quay lại danh sách sự kiện
          </Link>
        </div>

        {/* Event Summary Banner */}
        <div className="ev-org-event-banner">
          <div>
            <span className="ev-eyebrow">
              {isDraft ? "Bản nháp (DRAFT)" : "Đang mở bán (PUBLISHED)"}
            </span>
            <h2>{event.title}</h2>
            <p>{event.location}, {event.city}</p>
          </div>
          {isDraft && (
            <button
              className="ev-btn-primary"
              onClick={() => setShowAddModal(true)}
              type="button"
            >
              <LineIcon name="plus" />
              Thêm hạng vé
            </button>
          )}
        </div>

        {!isDraft && (
          <div className="ev-customer-banner" style={{ background: "#f8f9fb", border: "1px solid var(--eh-border)" }}>
            <LineIcon name="info" />
            <span>
              Sự kiện đã được <strong>PUBLISHED</strong>. Theo quy tắc nghiệp vụ BR07, loại vé chỉ có thể chỉnh sửa/xóa khi sự kiện ở trạng thái <strong>DRAFT</strong>.
            </span>
          </div>
        )}

        {/* Ticket Types List */}
        <div className="ev-org-ticket-types-grid">
          {ticketTypes.map((ticket) => (
            <article className="ev-org-ticket-card" key={ticket.id}>
              <div className="ev-org-ticket-card-header">
                <div>
                  <h3>{ticket.name}</h3>
                  <p>{ticket.description || "Không có mô tả bổ sung"}</p>
                </div>
                <strong>{formatCurrency(ticket.price)}</strong>
              </div>

              <div className="ev-org-ticket-metrics">
                <div>
                  <small>Tổng số lượng</small>
                  <strong>{ticket.quantity} vé</strong>
                </div>
                <div>
                  <small>Đã bán</small>
                  <span>{ticket.soldQuantity} vé</span>
                </div>
                <div>
                  <small>Còn khả dụng</small>
                  <strong style={{ color: "var(--eh-green)" }}>{ticket.availableQuantity} vé</strong>
                </div>
              </div>

              {isDraft && (
                <div className="ev-org-ticket-card-actions">
                  <button
                    className="ev-org-btn-danger"
                    onClick={() => handleDeleteTicket(ticket.id)}
                    type="button"
                  >
                    <LineIcon name="trash" />
                    Xóa hạng vé
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="ev-org-bottom-nav">
          <Link className="ev-btn-outline" to="/organizer/dashboard">
            Quay lại Dashboard
          </Link>
          <Link
            className="ev-btn-primary"
            to={`/organizer/events/${event.id}/edit`}
          >
            Chuyển sang bước Duyệt & Xuất bản sự kiện →
          </Link>
        </div>

        {/* Modal Thêm Hạng Vé */}
        {showAddModal && (
          <div className="checkout-expired" role="dialog" aria-modal="true">
            <div style={{ maxWidth: "480px", textAlign: "left", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Thêm hạng vé mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: "transparent", border: 0, cursor: "pointer" }}
                  type="button"
                >
                  <LineIcon name="x" />
                </button>
              </div>

              <form onSubmit={handleAddTicket}>
                <div className="ev-form-group" style={{ marginBottom: "12px" }}>
                  <label htmlFor="tName">Tên hạng vé *</label>
                  <input
                    id="tName"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: VIP Pass, Early Bird"
                    required
                    type="text"
                    value={name}
                  />
                </div>

                <div className="ev-form-grid-2" style={{ marginBottom: "12px" }}>
                  <div className="ev-form-group">
                    <label htmlFor="tPrice">Giá vé (VNĐ) *</label>
                    <input
                      id="tPrice"
                      min={0}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                      type="number"
                      value={price}
                    />
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="tQuantity">Số lượng mở bán *</label>
                    <input
                      id="tQuantity"
                      min={1}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                      type="number"
                      value={quantity}
                    />
                  </div>
                </div>

                <div className="ev-form-group" style={{ marginBottom: "20px" }}>
                  <label htmlFor="tDesc">Mô tả quyền lợi</label>
                  <input
                    id="tDesc"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bao gồm đồ uống, tài liệu workshop..."
                    type="text"
                    value={description}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    className="ev-btn-outline"
                    onClick={() => setShowAddModal(false)}
                    type="button"
                  >
                    Hủy
                  </button>
                  <button className="ev-btn-primary" type="submit">
                    Lưu hạng vé
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
