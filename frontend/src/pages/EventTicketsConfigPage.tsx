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
    if (lock.current || !isDraft || !window.confirm(`Xóa loại vé "${ticket.name}" khỏi sự kiện?`)) return;

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
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Header sự kiện banner */}
        {event && (
          <div
            style={{
              background: "var(--eh-surface)",
              border: "1px solid var(--eh-border)",
              borderRadius: "var(--radius-2xl)",
              padding: "24px 28px",
              boxShadow: "var(--eh-shadow-xs)",
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
                    background: event.status === "PUBLISHED" ? "#10b981" : "#f59e0b",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {event.status === "PUBLISHED" ? "Đang mở bán" : event.status}
                </span>
                <span style={{ fontSize: "13px", color: "var(--eh-text-muted)" }}>
                  <LineIcon name="calendar" /> {formatDate(event.startAt)}
                </span>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 4px", color: "var(--eh-text-primary)", letterSpacing: "-0.03em" }}>
                {event.title}
              </h1>
              <small style={{ color: "var(--eh-text-muted)", fontFamily: "monospace", fontSize: "12px" }}>ID: {id}</small>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link className="btn btn-secondary" to={`/organizer/events/${id}/edit`}>
                <LineIcon name="arrow-right" /> Quản lý vòng đời
              </Link>
              {event.status === "PUBLISHED" && (
                <Link
                  className="btn btn-primary"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                  to={`/events/${id}`}
                >
                  Xem trang công khai
                </Link>
              )}
            </div>
          </div>
        )}

        <RequestState error={resource.error || error} loading={resource.loading} onRetry={resource.reload} />

        {message && (
          <div
            role="status"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#059669",
              padding: "12px 18px",
              borderRadius: "var(--radius-lg)",
              fontSize: "13px",
              fontWeight: "700",
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
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              padding: "14px 18px",
              borderRadius: "var(--radius-lg)",
              fontSize: "13px",
              color: "#92400e",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <LineIcon name="alert" />
            <span>
              <strong>Lưu ý:</strong> Sự kiện đã được xuất bản (<code>{event.status}</code>). Để bảo đảm quyền lợi người đã mua vé, không thể thêm hoặc xóa hạng vé mới.
            </span>
          </div>
        )}

        <div className="eh-ticket-config-grid" style={{ gridTemplateColumns: isDraft ? "1fr 400px" : "1fr" }}>
          {/* Cột danh sách hạng vé */}
          <section style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--eh-text-primary)" }}>
                Các hạng vé hiện có ({types.length})
              </h2>
              {totalCapacity > 0 && (
                <span style={{ fontSize: "13px", color: "var(--eh-text-muted)" }}>
                  Tổng sức chứa: <strong>{totalCapacity} vé</strong> (Đã bán/giữ: <strong style={{ color: "var(--eh-brand)" }}>{totalSold}</strong>)
                </span>
              )}
            </div>

            {types.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {types.map((ticket) => {
                  const remaining = Math.max(0, ticket.quantity - ticket.soldQuantity);
                  const percent = Math.min(100, Math.round((ticket.soldQuantity / ticket.quantity) * 100));

                  return (
                    <article className="eh-ticket-type-card" key={ticket.id}>
                      <div className="eh-ticket-type-head">
                        <div>
                          <h3 className="eh-ticket-type-name">{ticket.name}</h3>
                          <p className="eh-ticket-type-desc">
                            {ticket.description || "Không có mô tả bổ sung"}
                          </p>
                        </div>
                        <span className="eh-ticket-type-price">
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>

                      {/* Tiến độ bán vé */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--eh-text-secondary)" }}>
                          <span>
                            Đã bán: <strong>{ticket.soldQuantity}</strong> / {ticket.quantity} vé
                          </span>
                          <span>
                            Còn lại: <strong style={{ color: remaining <= 5 ? "#dc2626" : "var(--eh-text-primary)" }}>{remaining} vé</strong> ({percent}%)
                          </span>
                        </div>
                        <div className="eh-progress-track">
                          <div
                            className="eh-progress-fill"
                            style={{
                              width: `${percent}%`,
                              background: percent >= 90 ? "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)" : "linear-gradient(90deg, #6366f1 0%, #10b981 100%)",
                            }}
                          />
                        </div>
                      </div>

                      {isDraft && (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "10px", borderTop: "1px solid var(--eh-surface-alt)" }}>
                          <button
                            className="btn btn-secondary"
                            disabled={busy}
                            onClick={() => setEditing(ticket)}
                            style={{ fontSize: "12px", minHeight: "32px", padding: "0 14px", fontWeight: "700" }}
                            type="button"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            className="btn btn-secondary"
                            disabled={busy}
                            onClick={() => remove(ticket)}
                            style={{ fontSize: "12px", minHeight: "32px", padding: "0 14px", color: "#dc2626", borderColor: "#fecaca", fontWeight: "700" }}
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
              <div style={{ background: "var(--eh-surface)", padding: "40px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)", textAlign: "center", color: "var(--eh-text-muted)", fontSize: "14px" }}>
                Chưa có hạng vé nào được tạo. Hãy sử dụng form bên cạnh để thiết lập vé đầu tiên.
              </div>
            )}
          </section>

          {/* Form thêm/sửa loại vé */}
          {isDraft && (
            <aside style={{ background: "var(--eh-surface)", padding: "28px", borderRadius: "var(--radius-2xl)", border: "1px solid var(--eh-border)", boxShadow: "var(--eh-shadow-xs)" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", margin: "0 0 18px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
                {editing ? `Sửa hạng vé: ${editing.name}` : "Tạo loại vé mới"}
              </h3>

              <form key={editing?.id ?? "new"} onSubmit={save} style={{ display: "grid", gap: "18px" }}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "18px" }}>
                  <div className="ev-form-group">
                    <label htmlFor="ticket-name">Tên loại vé *</label>
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
                      placeholder="Bao gồm tài liệu sự kiện, teabreak, quà tặng độc quyền..."
                      rows={3}
                    />
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="ticket-price">Giá vé (VNĐ) *</label>
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
                    <label htmlFor="ticket-quantity">Số lượng phát hành *</label>
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

                  <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                    <button
                      className="btn btn-primary"
                      disabled={busy}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                        fontWeight: "800",
                        fontSize: "13px",
                      }}
                      type="submit"
                    >
                      {busy ? "Đang lưu..." : editing ? "Cập nhật vé" : "Tạo hạng vé"}
                    </button>
                    {editing && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditing(undefined)}
                        style={{ fontWeight: "700" }}
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
