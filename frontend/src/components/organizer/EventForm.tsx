import { useRef, useState, type FormEvent } from "react";
import type { EventDto } from "../../api/events";
import type { CreateEventPayload } from "../../api/organizer";
import { RequestState } from "../ui/RequestState";
import { toLocalDateTime } from "../../utils/organizerState";
import { LineIcon } from "../ui/LineIcon";
import { formatDate } from "../../utils/format";

type Props = {
  initial?: EventDto;
  onSave: (payload: CreateEventPayload) => Promise<void>;
  onDirty?: () => void;
  disabled?: boolean;
};

const categorySuggestions = [
  "Công nghệ",
  "Âm nhạc",
  "Workshop",
  "Kinh doanh",
  "Nghệ thuật",
  "Ẩm thực",
  "Thể thao",
];

const samplePhotos = [
  { label: "Hội thảo Tech", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" },
  { label: "Concert Live", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80" },
  { label: "Workshop UI/UX", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80" },
  { label: "Festival Ngoài trời", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80" },
];

export function EventForm({ initial, onSave, onDirty, disabled }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const isDraft = !initial || initial.status === "DRAFT";
  const closed = initial?.status === "CANCELLED" || initial?.status === "COMPLETED";

  // Live preview states
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [category, setCategory] = useState(initial?.category || "Công nghệ");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initial?.thumbnailUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
  );
  const [startAt, setStartAt] = useState(toLocalDateTime(initial?.startAt));
  const [endAt, setEndAt] = useState(toLocalDateTime(initial?.endAt));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current || closed) return;

    setError("");
    const start = isDraft ? new Date(startAt) : new Date(initial!.startAt);
    const end = isDraft ? new Date(endAt) : new Date(initial!.endAt);

    if (isDraft && (!Number.isFinite(start.getTime()) || start <= new Date() || end <= start)) {
      setError("Vui lòng chọn thời gian bắt đầu trong tương lai và kết thúc sau thời gian bắt đầu.");
      return;
    }

    lock.current = true;
    setBusy(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category: isDraft ? category.trim() : initial?.category,
        thumbnailUrl: isDraft ? thumbnailUrl.trim() : initial?.thumbnailUrl,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa thể lưu sự kiện.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="eh-event-form-grid">
      {/* Form nhập liệu */}
      <form className="eh-form-main-card" onChange={onDirty} onSubmit={submit}>
        <RequestState error={error} />

        <fieldset disabled={busy || disabled || closed} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "22px" }}>
          <div className="ev-form-group">
            <label htmlFor="event-title">Tên sự kiện *</label>
            <input
              id="event-title"
              maxLength={255}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Vietnam AI & Cloud Summit 2026"
              required
              value={title}
            />
          </div>

          <div className="ev-form-group">
            <label htmlFor="event-description">Mô tả sự kiện chi tiết *</label>
            <textarea
              id="event-description"
              name="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung sự kiện, các diễn giả tham dự, lịch trình và trải nghiệm khán giả..."
              required
              rows={5}
              value={description}
            />
          </div>

          <div className="ev-form-group">
            <label htmlFor="event-location">Địa điểm tổ chức (Kèm thành phố) *</label>
            <input
              id="event-location"
              name="location"
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ví dụ: GEM Center, 8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM"
              required
              value={location}
            />
          </div>

          {isDraft && (
            <>
              {/* Danh mục chủ đề */}
              <div className="ev-form-group">
                <label>Chủ đề / Thể loại sự kiện</label>
                <div className="eh-category-chips">
                  {categorySuggestions.map((cat) => (
                    <button
                      key={cat}
                      className={`eh-cat-chip-btn ${category === cat ? "is-active" : ""}`}
                      onClick={() => setCategory(cat)}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  id="event-category"
                  name="category"
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Hoặc tự nhập danh mục khác..."
                  value={category}
                />
              </div>

              {/* Ảnh bìa URL */}
              <div className="ev-form-group">
                <label htmlFor="event-thumbnail">Đường dẫn Poster / Ảnh bìa (URL)</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <small style={{ color: "var(--eh-text-muted)", width: "100%", fontSize: "11px", fontWeight: "700" }}>
                    Chọn nhanh ảnh mẫu HD chất lượng cao:
                  </small>
                  {samplePhotos.map((p) => (
                    <button
                      key={p.label}
                      className="eh-photo-preset-btn"
                      onClick={() => setThumbnailUrl(p.url)}
                      type="button"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  id="event-thumbnail"
                  name="thumbnailUrl"
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  type="url"
                  value={thumbnailUrl}
                />
              </div>

              {/* Thời gian */}
              <div className="ev-form-grid-2">
                <div className="ev-form-group">
                  <label htmlFor="event-start">Thời gian bắt đầu *</label>
                  <input
                    id="event-start"
                    name="startAt"
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    type="datetime-local"
                    value={startAt}
                  />
                </div>
                <div className="ev-form-group">
                  <label htmlFor="event-end">Thời gian kết thúc *</label>
                  <input
                    id="event-end"
                    name="endAt"
                    onChange={(e) => setEndAt(e.target.value)}
                    required
                    type="datetime-local"
                    value={endAt}
                  />
                </div>
              </div>
            </>
          )}

          {!closed && (
            <div style={{ paddingTop: "10px" }}>
              <button
                className="btn btn-primary"
                disabled={busy}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  minHeight: "48px",
                  fontSize: "14px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 6px 18px rgba(99, 102, 241, 0.35)",
                }}
                type="submit"
              >
                {busy
                  ? "Đang lưu trên hệ thống..."
                  : initial
                  ? "Lưu cập nhật sự kiện"
                  : "Tạo bản nháp & Chuyển sang Cấu hình vé"}
              </button>
            </div>
          )}
        </fieldset>
      </form>

      {/* Cột phải: Live Preview */}
      <aside className="eh-live-preview-box">
        <span className="eh-preview-head-kicker">
          <LineIcon name="sparkles" /> XEM TRƯỚC THEO THỜI GIAN THỰC
        </span>

        <div className="eh-preview-card-frame">
          {/* Ảnh bìa */}
          <div style={{ height: "160px", position: "relative", background: "#0f172a" }}>
            {thumbnailUrl ? (
              <img
                alt="Xem trước ảnh sự kiện"
                src={thumbnailUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                Chưa có ảnh bìa
              </div>
            )}
            <span
              style={{
                position: "absolute",
                bottom: "10px",
                left: "12px",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "4px",
                backdropFilter: "blur(4px)",
              }}
            >
              {category || "Chủ đề"}
            </span>
          </div>

          {/* Chi tiết nội dung card */}
          <div style={{ padding: "16px", display: "grid", gap: "8px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "800", margin: 0, color: "var(--eh-text-primary)", lineHeight: "1.35" }}>
              {title || "Tên sự kiện của bạn"}
            </h4>
            <p style={{ fontSize: "12px", color: "var(--eh-text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <LineIcon name="map-pin" /> {location || "Địa điểm tổ chức"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--eh-text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <LineIcon name="calendar" /> {startAt ? formatDate(new Date(startAt).toISOString()) : "Ngày diễn ra"}
            </p>
            <div style={{ borderTop: "1px solid var(--eh-border)", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "13px", color: "var(--eh-brand-dark)" }}>Từ 0đ</strong>
              <span style={{ fontSize: "11px", color: "var(--eh-text-muted)" }}>Sắp mở bán</span>
            </div>
          </div>
        </div>

        <small style={{ color: "var(--eh-text-muted)", fontSize: "12px", lineHeight: "1.5" }}>
          Thẻ xem trước mô phỏng chính xác giao diện hiển thị trên trang Khám phá sau khi bạn xuất bản sự kiện.
        </small>
      </aside>
    </div>
  );
}
