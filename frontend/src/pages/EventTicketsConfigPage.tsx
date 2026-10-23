import { useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { createTicketTypeApi, deleteTicketTypeApi, getEventApi, updateTicketTypeApi } from "../api/organizer";
import { getEventTicketTypes, type TicketTypeDto } from "../api/events";
import { useApiResource } from "../hooks/useApiResource";
import { formatCurrency, formatDate } from "../utils/format";

export function EventTicketsConfigPage() {
  const { id } = useParams();
  const resource = useApiResource(async () => {
    const [event, types] = await Promise.all([getEventApi(id!), getEventTicketTypes(id!)]);
    return { event, types };
  }, [id]);

  const [editing, setEditing] = useState<TicketTypeDto>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isDraft = resource.data?.event.status === "DRAFT";

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current || !isDraft) return;

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")).trim(),
      description: String(form.get("description") ?? ""),
      price: Number(form.get("price")),
      quantity: Number(form.get("quantity")),
    };

    if (!Number.isInteger(payload.quantity) || payload.quantity < 1 || payload.price <= 0) {
      setError("Giá vé phải lớn hơn 0 và số lượng phát hành là số nguyên dương.");
      return;
    }

    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (editing) {
        await updateTicketTypeApi(editing.id, payload);
      } else {
        await createTicketTypeApi(id!, payload);
      }
      setEditing(undefined);
      resource.reload();
      setMessage("Đã lưu loại vé thành công trên hệ thống!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu loại vé.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function remove(ticket: TicketTypeDto) {
    if (lock.current || !isDraft || !window.confirm(`Xóa loại vé "${ticket.name}"?`)) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await deleteTicketTypeApi(ticket.id);
      if (editing?.id === ticket.id) setEditing(undefined);
      resource.reload();
      setMessage("Đã xóa loại vé khỏi hệ thống.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa loại vé.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const event = resource.data?.event;
  const types = resource.data?.types ?? [];
  const totalCapacity = types.reduce((sum, t) => sum + t.quantity, 0);
  const totalSold = types.reduce((sum, t) => sum + t.soldQuantity, 0);

  return (
    <OrganizerLayout
      description="Cấu hình các hạng vé, thiết lập mức giá và số lượng mở bán trước khi xuất bản sự kiện."
      title="Cấu hình loại vé & Giá mở bán"
    >
      <div style={{ display: "grid", gap: "28px" }}>
        {/* Header sự kiện banner */}
        {event && (
          <div
            style={{
              background: "var(--eh-surface)",
              border: "1px solid var(--eh-border)",
              borderRadius: "var(--radius-xl)",
              padding: "24px 28px",
              boxShadow: "var(--eh-shadow-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    background: event.status === "PUBLISHED" ? "var(--eh-green)" : "var(--eh-amber)",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                  }}
                >
                  {event.status}
                </span>
                <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
                  <LineIcon name="calendar" /> {formatDate(event.startAt)}
                </span>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 4px", color: "var(--eh-text)" }}>
                {event.title}
              </h1>
              <small style={{ color: "var(--eh-placeholder)", fontFamily: "monospace" }}>ID: {id}</small>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link className="btn btn-secondary" to={`/organizer/events/${id}/edit`}>
                <LineIcon name="arrow-right" /> Quản lý vòng đời
              </Link>
              {event.status === "PUBLISHED" && (
                <Link className="btn btn-primary" to={`/events/${id}`}>
                  Xem trang công khai
                </Link>
              )}
            </div>
          </div>
        )}

        <RequestState error={resource.error || error} loading={resource.loading} onRetry={resource.reload} />

        {message && (
          <div
            style={{
              background: "var(--eh-green-50)",
              border: "1px solid var(--eh-green-100)",
              color: "var(--eh-green)",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <LineIcon name="check" /> {message}
          </div>
        )}

        {/* Thông báo nếu không phải DRAFT */}
        {!isDraft && event && (
          <div style={{ background: "#fef3e0", border: "1px solid #fde68a", padding: "14px 18px", borderRadius: "var(--radius-md)", fontSize: "13px", color: "#b45309" }}>
            <LineIcon name="info" /> <strong>Lưu ý:</strong> Sự kiện đã được xuất bản (<code>{event.status}</code>). Để bảo đảm quyền lợi người đã mua vé, không thể thêm hoặc xóa hạng vé mới.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isDraft ? "1fr 400px" : "1fr", gap: "28px", alignItems: "start" }}>
          {/* Cột danh sách hạng vé */}
          <section style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--eh-text)" }}>
                Các hạng vé hiện có ({types.length})
              </h2>
              {totalCapacity > 0 && (
                <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
                  Tổng sức chứa: <strong>{totalCapacity} vé</strong> (Đã bán/giữ: <strong>{totalSold}</strong>)
                </span>
              )}
            </div>

            {types.length > 0 ? (
              <div style={{ display: "grid", gap: "14px" }}>
                {types.map((ticket) => {
                  const remaining = Math.max(0, ticket.quantity - ticket.soldQuantity);
                  const percent = Math.min(100, Math.round((ticket.soldQuantity / ticket.quantity) * 100));

                  return (
                    <article
                      key={ticket.id}
                      style={{
                        background: "var(--eh-surface)",
                        border: "1px solid var(--eh-border)",
                        borderRadius: "var(--radius-xl)",
                        padding: "20px 24px",
                        boxShadow: "var(--eh-shadow-sm)",
                        display: "grid",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 4px", color: "var(--eh-text)" }}>
                            {ticket.name}
                          </h3>
                          <p style={{ fontSize: "12px", color: "var(--eh-muted)", margin: 0 }}>
                            {ticket.description || "Không có mô tả bổ sung"}
                          </p>
                        </div>
                        <strong style={{ fontSize: "18px", color: "var(--eh-green)", fontWeight: "900", letterSpacing: "-0.03em" }}>
                          {formatCurrency(ticket.price)}
                        </strong>
                      </div>

                      {/* Tiến độ bán vé */}
                      <div style={{ display: "grid", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--eh-muted)" }}>
                          <span>Đã bán: <strong>{ticket.soldQuantity}</strong> / {ticket.quantity} vé</span>
                          <span>Còn lại: <strong style={{ color: remaining <= 5 ? "var(--eh-error)" : "var(--eh-text)" }}>{remaining} vé</strong> ({percent}%)</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "var(--eh-bg)", borderRadius: "999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              height: "100%",
                              background: percent >= 90 ? "var(--eh-error)" : "var(--eh-green)",
                              borderRadius: "999px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {isDraft && (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--eh-border)" }}>
                          <button
                            className="btn btn-secondary"
                            disabled={busy}
                            onClick={() => setEditing(ticket)}
                            style={{ fontSize: "11px", minHeight: "30px", padding: "0 12px" }}
                            type="button"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            disabled={busy}
                            onClick={() => remove(ticket)}
                            style={{ fontSize: "11px", minHeight: "30px", padding: "0 12px", color: "var(--eh-error)" }}
                            type="button"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: "var(--eh-surface)", padding: "36px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)", textAlign: "center", color: "var(--eh-muted)", fontSize: "13px" }}>
                Chưa có hạng vé nào được tạo. Hãy sử dụng form bên cạnh để thiết lập vé đầu tiên.
              </div>
            )}
          </section>

          {/* Form thêm/sửa loại vé */}
          {isDraft && (
            <aside style={{ background: "var(--eh-surface)", padding: "26px", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--eh-border)", boxShadow: "var(--eh-warm-shadow)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 16px", color: "var(--eh-text)" }}>
                {editing ? `Sửa: ${editing.name}` : "Tạo loại vé mới"}
              </h3>

              <form onSubmit={save} key={editing?.id ?? "new"} style={{ display: "grid", gap: "16px" }}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "16px" }}>
                  <div className="ev-form-group">
                    <label htmlFor="ticket-name">Tên loại vé</label>
                    <input
                      defaultValue={editing?.name ?? ""}
                      id="ticket-name"
                      maxLength={100}
                      name="name"
                      placeholder="Ví dụ: Vé Tiêu Chuẩn (Standard) hoặc VIP"
                      required
                    />
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="ticket-description">Mô tả quyền lợi hạng vé</label>
                    <textarea
                      defaultValue={editing?.description ?? ""}
                      id="ticket-description"
                      name="description"
                      placeholder="Bao gồm tài liệu, teabreak hoặc quà tặng..."
                      rows={3}
                    />
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="ticket-price">Giá vé (VNĐ)</label>
                    <input
                      defaultValue={editing?.price ?? ""}
                      id="ticket-price"
                      min="0.01"
                      name="price"
                      placeholder="150000"
                      required
                      step="0.01"
                      type="number"
                    />
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="ticket-quantity">Số lượng phát hành</label>
                    <input
                      defaultValue={editing?.quantity ?? ""}
                      id="ticket-quantity"
                      min={1}
                      name="quantity"
                      placeholder="100"
                      required
                      step={1}
                      type="number"
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
                    <button
                      className="ev-btn-primary"
                      disabled={busy}
                      style={{ flex: 1, justifyContent: "center" }}
                      type="submit"
                    >
                      {busy ? "Đang lưu..." : editing ? "Cập nhật vé" : "Tạo hạng vé"}
                    </button>
                    {editing && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditing(undefined)}
                        type="button"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </fieldset>
              </form>
            </aside>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
