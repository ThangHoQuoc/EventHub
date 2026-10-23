import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { EventForm } from "../components/organizer/EventForm";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { cancelEventApi, getEventApi, publishEventApi, updateEventApi } from "../api/organizer";
import { useApiResource } from "../hooks/useApiResource";
import { eventUpdatePayload, rememberEvent } from "../utils/organizerState";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

export function EditEventPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const resource = useApiResource(() => getEventApi(id!), [id]);
  const event = resource.data;

  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function transition(action: "publish" | "cancel") {
    if (
      !event ||
      lock.current ||
      dirty ||
      !window.confirm(
        action === "publish"
          ? "Xuất bản sự kiện lên trang Khám phá để mở bán vé chính thức?"
          : "Hủy sự kiện này? Hành động này sẽ khóa đặt vé và không thể hoàn tác."
      )
    )
      return;

    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const updated = await (action === "publish" ? publishEventApi(event.id) : cancelEventApi(event.id));
      resource.setData(updated);
      setMessage(
        action === "publish"
          ? "Sự kiện đã được xuất bản chính thức thành công!"
          : "Sự kiện đã được chuyển sang trạng thái đã hủy."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái sự kiện.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const isDraft = event?.status === "DRAFT";
  const isPublished = event?.status === "PUBLISHED";
  const isCancelled = event?.status === "CANCELLED";

  return (
    <OrganizerLayout
      description="Quản lý vòng đời sự kiện: Chỉnh sửa thông tin chi tiết, cấu hình vé và phát hành ra công chúng."
      title="Biên tập & Quản lý vòng đời sự kiện"
    >
      <div style={{ display: "grid", gap: "24px" }}>
        {/* Nút quay lại */}
        <div>
          <Link
            className="ev-text-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
            to="/organizer/dashboard"
          >
            <span style={{ transform: "rotate(180deg)", display: "inline-block" }}>
              <LineIcon name="arrow-right" />
            </span>
            Quay lại bảng điều khiển sự kiện
          </Link>
        </div>

        <RequestState error={resource.error || error} loading={resource.loading} onRetry={resource.reload} />

        {message && (
          <div
            style={{
              background: "var(--eh-green-50)",
              border: "1px solid var(--eh-green-100)",
              color: "var(--eh-green)",
              padding: "14px 20px",
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

        {event && (
          <>
            {/* Thanh tiến trình vòng đời sự kiện (Event Lifecycle Stepper) */}
            <div
              style={{
                background: "var(--eh-surface)",
                border: "1px solid var(--eh-border)",
                borderRadius: "var(--radius-xl)",
                padding: "20px 28px",
                boxShadow: "var(--eh-shadow-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
                {/* Bước 1: Khởi tạo bản nháp */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--eh-green)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--eh-text)", display: "block" }}>1. Tạo bản nháp</strong>
                    <small style={{ fontSize: "11px", color: "var(--eh-muted)" }}>Thông tin sự kiện</small>
                  </div>
                </div>

                <div style={{ width: "32px", height: "2px", background: "var(--eh-green)" }} />

                {/* Bước 2: Cấu hình loại vé */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--eh-green)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--eh-text)", display: "block" }}>2. Hạng vé & Giá</strong>
                    <small style={{ fontSize: "11px", color: "var(--eh-muted)" }}>Kho số lượng vé</small>
                  </div>
                </div>

                <div style={{ width: "32px", height: "2px", background: isPublished ? "var(--eh-green)" : "var(--eh-border)" }} />

                {/* Bước 3: Xuất bản công khai */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isPublished ? "var(--eh-green)" : isDraft ? "var(--eh-amber)" : "#999",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px",
                    }}
                  >
                    {isPublished ? "✓" : "3"}
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--eh-text)", display: "block" }}>3. Xuất bản mở bán</strong>
                    <small style={{ fontSize: "11px", color: "var(--eh-muted)" }}>
                      {isPublished ? "Đang mở bán công khai" : "Chờ kích hoạt"}
                    </small>
                  </div>
                </div>
              </div>

              {/* Nút hành động vòng đời */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {isDraft && (
                  <button
                    className="ev-btn-primary"
                    disabled={busy || dirty}
                    onClick={() => transition("publish")}
                    style={{ minHeight: "40px", padding: "0 22px" }}
                    type="button"
                  >
                    <LineIcon name="check" /> {busy ? "Đang xuất bản..." : "Xuất bản sự kiện ngay"}
                  </button>
                )}

                {isPublished && (
                  <Link
                    className="btn btn-primary"
                    style={{ minHeight: "40px", padding: "0 18px" }}
                    to={`/events/${event.id}`}
                  >
                    Xem trang ngoài web <LineIcon name="arrow-right" />
                  </Link>
                )}

                {(isDraft || isPublished) && (
                  <button
                    className="btn btn-secondary"
                    disabled={busy || dirty}
                    onClick={() => transition("cancel")}
                    style={{ color: "var(--eh-error)", minHeight: "40px" }}
                    type="button"
                  >
                    Hủy sự kiện
                  </button>
                )}
              </div>
            </div>

            {dirty && (
              <div style={{ background: "#fef3e0", border: "1px solid #fde68a", padding: "10px 16px", borderRadius: "var(--radius-md)", fontSize: "12px", color: "#b45309" }}>
                <LineIcon name="info" /> Bạn có thay đổi chưa lưu trên form. Vui lòng bấm <strong>Lưu cập nhật sự kiện</strong> trước khi thao tác chuyển trạng thái.
              </div>
            )}

            {/* Form chỉnh sửa */}
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--eh-text)" }}>
                  Thông tin nội dung sự kiện
                </h2>
                <Link
                  className="btn btn-secondary"
                  style={{ fontSize: "12px" }}
                  to={`/organizer/events/${event.id}/tickets`}
                >
                  <LineIcon name="ticket" /> Quản lý các hạng vé
                </Link>
              </div>

              <EventForm
                disabled={busy}
                initial={event}
                key={`${event.id}:${event.updatedAt}:${event.status}`}
                onDirty={() => setDirty(true)}
                onSave={async (payload) => {
                  const updated = await updateEventApi(event.id, eventUpdatePayload(event, payload));
                  resource.setData(updated);
                  setDirty(false);
                  setMessage("Đã lưu cập nhật sự kiện thành công!");
                  rememberEvent(user!.id, event.id);
                  setTimeout(() => setMessage(""), 3500);
                }}
              />
            </div>
          </>
        )}
      </div>
    </OrganizerLayout>
  );
}
