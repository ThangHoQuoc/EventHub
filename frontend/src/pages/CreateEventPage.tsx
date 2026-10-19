import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";

export function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Công nghệ");
  const [city, setCity] = useState<"TP.HCM" | "Hà Nội" | "Đà Nẵng" | "Cần Thơ">("TP.HCM");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("2026-11-15T09:00");
  const [endAt, setEndAt] = useState("2026-11-15T17:00");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80");
  const [tags, setTags] = useState("Workshop, Tech, Networking");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Giả lập lưu DRAFT qua POST /api/v1/events
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/organizer/events/new-event-draft/tickets");
    }, 700);
  }

  return (
    <OrganizerLayout
      activeNav="create"
      description="Điền thông tin ban đầu để khởi tạo bản nháp (DRAFT). Bạn có thể cấu hình hạng vé ở bước tiếp theo."
      title="Tạo sự kiện mới"
    >
      <div className="ev-org-form-container">
        {/* Step indicator */}
        <div className="ev-org-steps-bar">
          <div className="ev-org-step is-active">
            <span>1</span>
            <strong>Thông tin sự kiện</strong>
          </div>
          <div className="ev-org-step-divider" />
          <div className="ev-org-step">
            <span>2</span>
            <strong>Cấu hình vé & Xuất bản</strong>
          </div>
        </div>

        <form className="ev-org-form-card" onSubmit={handleSubmit}>
          <div className="ev-form-group">
            <label htmlFor="title">Tên sự kiện *</label>
            <input
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Vietnam AI & Cloud Summit 2026"
              required
              type="text"
              value={title}
            />
          </div>

          <div className="ev-form-grid-2">
            <div className="ev-form-group">
              <label htmlFor="category">Chủ đề / Danh mục</label>
              <select
                id="category"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="Công nghệ">Công nghệ</option>
                <option value="Âm nhạc">Âm nhạc</option>
                <option value="Workshop">Workshop</option>
                <option value="Kinh doanh">Kinh doanh / Networking</option>
                <option value="Nghệ thuật">Nghệ thuật</option>
              </select>
            </div>

            <div className="ev-form-group">
              <label htmlFor="city">Thành phố tổ chức</label>
              <select
                id="city"
                onChange={(e) => setCity(e.target.value as any)}
                value={city}
              >
                <option value="TP.HCM">TP.HCM</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>
          </div>

          <div className="ev-form-group">
            <label htmlFor="location">Địa điểm cụ thể *</label>
            <input
              id="location"
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: GEM Center, 8 Nguyễn Bỉnh Khiêm, Quận 1"
              required
              type="text"
              value={location}
            />
          </div>

          <div className="ev-form-grid-2">
            <div className="ev-form-group">
              <label htmlFor="startAt">Thời gian bắt đầu *</label>
              <input
                id="startAt"
                onChange={(e) => setStartAt(e.target.value)}
                required
                type="datetime-local"
                value={startAt}
              />
            </div>

            <div className="ev-form-group">
              <label htmlFor="endAt">Thời gian kết thúc *</label>
              <input
                id="endAt"
                onChange={(e) => setEndAt(e.target.value)}
                required
                type="datetime-local"
                value={endAt}
              />
            </div>
          </div>

          <div className="ev-form-group">
            <label htmlFor="description">Mô tả sự kiện *</label>
            <textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung, diễn giả, đối tượng tham gia và quyền lợi của người tham dự..."
              required
              rows={5}
              value={description}
            />
          </div>

          <div className="ev-form-group">
            <label htmlFor="imageUrl">Đường dẫn Poster / Ảnh bìa sự kiện (URL)</label>
            <input
              id="imageUrl"
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              type="url"
              value={imageUrl}
            />
          </div>

          <div className="ev-form-group">
            <label htmlFor="tags">Tags tìm kiếm (phân cách bằng dấu phẩy)</label>
            <input
              id="tags"
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tech, AI, Cloud, Python"
              type="text"
              value={tags}
            />
          </div>

          <div className="ev-org-form-actions">
            <Link className="ev-btn-outline" to="/organizer/dashboard">
              Hủy
            </Link>
            <button className="ev-btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Đang lưu bản nháp..." : "Lưu bản nháp & Thiết lập vé →"}
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
