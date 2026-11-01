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
          ? "Xuất bản sự kiện lên trang Khám phá để mở bán vé chính thức cho khán giả?"
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

  return (
    <OrganizerLayout
      description="Quản lý toàn diện vòng đời sự kiện: Chỉnh sửa thông tin chi tiết, quản lý cơ cấu vé và phát hành vé chính thức."
      title="Biên tập & Quản lý vòng đời sự kiện"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Lối tắt quay lại */}
        <div>
          <Link
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "700",
              color: "var(--eh-brand)",
              textDecoration: "none",
            }}
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
            role="status"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#059669",
              padding: "14px 20px",
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

        {event && (
          <>
            {/* Thanh tiến trình vòng đời sự kiện (Event Lifecycle Stepper) */}
            <div className="eh-lifecycle-stepper">
              <div className="eh-stepper-track">
                {/* Bước 1: Khởi tạo bản nháp */}
                <div className="eh-step-node">
                  <div className="eh-step-circle is-done">✓</div>
                  <div className="eh-step-meta">
                    <strong>1. Tạo bản nháp</strong>
                    <small>Nội dung & Địa điểm</small>
                  </div>
                </div>

                <div className="eh-stepper-connector is-active" />

                {/* Bước 2: Cấu hình loại vé */}
                <div className="eh-step-node">
                  <div className="eh-step-circle is-done">✓</div>
                  <div className="eh-step-meta">
                    <strong>2. Hạng vé & Giá</strong>
                    <small>Số lượng & Quyền lợi</small>
                  </div>
                </div>

                <div className={`eh-stepper-connector ${isPublished ? "is-active" : ""}`} />

                {/* Bước 3: Xuất bản mở bán */}
                <div className="eh-step-node">
                  <div className={`eh-step-circle ${isPublished ? "is-done" : isDraft ? "is-active" : "is-upcoming"}`}>
                    {isPublished ? "✓" : "3"}
                  </div>
                  <div className="eh-step-meta">
                    <strong>3. Xuất bản mở bán</strong>
                    <small>
                      {isPublished ? "Đang mở bán trực tuyến" : "Chờ kích hoạt"}
                    </small>
                  </div>
                </div>
              </div>

              {/* Nút hành động vòng đời */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {isDraft && (
                  <button
                    className="btn btn-primary"
                    disabled={busy || dirty}
                    onClick={() => transition("publish")}
                    style={{
                      minHeight: "40px",
                      padding: "0 22px",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      fontSize: "13px",
                      fontWeight: "800",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    }}
                    type="button"
                  >
                    <LineIcon name="check" /> {busy ? "Đang xuất bản..." : "Xuất bản sự kiện ngay"}
                  </button>
                )}

                {isPublished && (
                  <Link
                    className="btn btn-primary"
                    style={{
                      minHeight: "40px",
                      padding: "0 18px",
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      fontSize: "13px",
                      fontWeight: "800",
                    }}
                    to={`/events/${event.id}`}
                  >
                    Xem trang vé ngoài web <LineIcon name="arrow-right" />
                  </Link>
                )}

                {(isDraft || isPublished) && (
                  <button
                    className="btn btn-secondary"
                    disabled={busy || dirty}
                    onClick={() => transition("cancel")}
                    style={{ color: "#dc2626", borderColor: "#fecaca", minHeight: "40px", fontSize: "12px", fontWeight: "700" }}
                    type="button"
                  >
                    Hủy sự kiện
                  </button>
                )}
              </div>
            </div>

            {dirty && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  padding: "12px 18px",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "13px",
                  color: "#92400e",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LineIcon name="alert" /> Bạn có thay đổi chưa lưu trên form. Vui lòng bấm <strong>Lưu cập nhật sự kiện</strong> trước khi thao tác chuyển trạng thái.
              </div>
            )}

            {/* Form chỉnh sửa */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--eh-text-primary)" }}>
                  Thông tin nội dung sự kiện
                </h2>
                <Link
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "0 16px", fontWeight: "700" }}
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
