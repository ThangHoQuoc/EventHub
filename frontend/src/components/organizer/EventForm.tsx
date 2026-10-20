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
  { label: "Festival", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80" },
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>
      {/* Form nhập liệu */}
      <form className="ev-org-form-card" onSubmit={submit} onChange={onDirty} style={{ background: "var(--eh-surface)", padding: "32px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
        <RequestState error={error} />

        <fieldset disabled={busy || disabled || closed} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: "20px" }}>
          <div className="ev-form-group">
            <label htmlFor="event-title">Tên sự kiện</label>
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
            <label htmlFor="event-description">Mô tả sự kiện chi tiết</label>
            <textarea
              id="event-description"
              name="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung sự kiện, diễn giả, trải nghiệm mà người tham dự sẽ nhận được..."
              required
              rows={5}
              value={description}
            />
          </div>

          <div className="ev-form-group">
            <label htmlFor="event-location">Địa điểm tổ chức (Kèm thành phố)</label>
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
              {/* Danh mục */}
              <div className="ev-form-group">
                <label>Chủ đề / Danh mục</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {categorySuggestions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${category === cat ? "var(--eh-green)" : "var(--eh-border)"}`,
                        background: category === cat ? "var(--eh-green-50)" : "var(--eh-bg)",
                        color: category === cat ? "var(--eh-green)" : "var(--eh-text)",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
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
                  placeholder="Hoặc tự nhập danh mục tùy chọn..."
                  value={category}
                />
              </div>

              {/* Ảnh bìa URL */}
              <div className="ev-form-group">
                <label htmlFor="event-thumbnail">Đường dẫn Poster / Ảnh bìa (URL)</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <small style={{ color: "var(--eh-placeholder)", width: "100%" }}>Chọn nhanh ảnh mẫu thực tế:</small>
                  {samplePhotos.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setThumbnailUrl(p.url)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--eh-border)",
                        background: "var(--eh-bg)",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
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
                  <label htmlFor="event-start">Thời gian bắt đầu</label>
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
                  <label htmlFor="event-end">Thời gian kết thúc</label>
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
                className="ev-btn-primary"
                disabled={busy}
                style={{ width: "100%", justifyContent: "center", minHeight: "48px", fontSize: "14px" }}
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
      <aside style={{ position: "sticky", top: "90px", display: "grid", gap: "16px" }}>
        <div style={{ background: "var(--eh-surface)", padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)", boxShadow: "var(--eh-shadow-sm)" }}>
          <span style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "6px" }}>
            <LineIcon name="sparkles" /> XEM TRƯỚC THEO THỜI GIAN THỰC
          </span>

          <div
            style={{
              marginTop: "14px",
              background: "#ffffff",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--eh-border)",
              overflow: "hidden",
            }}
          >
            {/* Ảnh bìa */}
            <div style={{ height: "160px", position: "relative", background: "#15241d" }}>
              {thumbnailUrl ? (
                <img
                  alt="Xem trước ảnh sự kiện"
                  src={thumbnailUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                  Chưa có ảnh bìa
                </div>
              )}
              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  background: "rgba(0,0,0,0.65)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-sm)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {category || "Chủ đề"}
              </span>
            </div>

            {/* Chi tiết nội dung card */}
            <div style={{ padding: "16px", display: "grid", gap: "8px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "800", margin: 0, color: "var(--eh-text)", lineHeight: "1.3" }}>
                {title || "Tên sự kiện của bạn"}
              </h4>
              <p style={{ fontSize: "12px", color: "var(--eh-muted)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <LineIcon name="map-pin" /> {location || "Địa điểm tổ chức"}
              </p>
              <p style={{ fontSize: "12px", color: "var(--eh-muted)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <LineIcon name="calendar" /> {startAt ? formatDate(new Date(startAt).toISOString()) : "Ngày diễn ra"}
              </p>
              <div style={{ borderTop: "1px solid var(--eh-border)", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "13px", color: "var(--eh-green)" }}>Từ 0đ</strong>
                <span style={{ fontSize: "11px", color: "var(--eh-muted)" }}>Sắp mở bán</span>
              </div>
            </div>
          </div>

          <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block", marginTop: "10px" }}>
            Bản xem trước phản ánh hình ảnh xuất hiện ngoài trang Khám phá sau khi bạn xuất bản sự kiện.
          </small>
        </div>
      </aside>
    </div>
  );
}
