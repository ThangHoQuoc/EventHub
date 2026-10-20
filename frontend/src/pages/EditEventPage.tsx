import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockOrganizerEvents } from "../data/mockOrganizer";
import type { EventStatus } from "../types/event";

export function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = mockOrganizerEvents.find((e) => e.id === id) ?? mockOrganizerEvents[3];

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isDraft = status === "DRAFT";
  const isPublished = status === "PUBLISHED";
  const isCancelled = status === "CANCELLED";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("Đã lưu các thông tin chỉnh sửa thành công!");
    setTimeout(() => setFeedback(null), 3000);
  }

  function handlePublish() {
    if (!window.confirm("Bạn có chắc chắn muốn xuất bản sự kiện này lên trang khám phá công khai?")) return;
    setStatus("PUBLISHED");
    setFeedback("Sự kiện đã được XUẤT BẢN chính thức (PUBLISHED) và bắt đầu nhận đặt vé!");
  }

  function handleCancelEvent() {
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn hủy sự kiện này? Hành động này sẽ khóa đặt vé và không thể hoàn tác.")) return;
    setStatus("CANCELLED");
    setFeedback("Sự kiện đã được chuyển sang trạng thái ĐÃ HỦY (CANCELLED).");
  }

  return (
    <OrganizerLayout
      activeNav="dashboard"
      description="Quản lý thông tin và các bước chuyển trạng thái (DRAFT → PUBLISHED → CANCELLED) theo vòng đời sự kiện."
      title="Biên tập & Quản lý vòng đời sự kiện"
    >
      <div className="ev-org-edit-shell">
        <div className="ev-ticket-detail-back">
          <Link to="/organizer/dashboard">
            <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>
              <LineIcon name="arrow-right" />
            </span>
            Quay lại danh sách sự kiện
          </Link>
        </div>

        {feedback && (
          <div className="ev-customer-banner is-success">
            <LineIcon name="check" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="ev-org-edit-grid">
          {/* Main Edit Form */}
          <form className="ev-org-form-card" onSubmit={handleSave}>
            <div className="ev-profile-card-head">
              <h3>Thông tin sự kiện</h3>
              <p>
                {isPublished
                  ? "Sự kiện đang mở bán: Theo quy tắc BR06, bạn chỉ có thể cập nhật Tiêu đề, Mô tả và Địa điểm."
                  : "Bản nháp: Bạn có thể chỉnh sửa mọi trường trước khi xuất bản."}
              </p>
            </div>

            <div className="ev-form-group">
              <label htmlFor="eTitle">Tên sự kiện</label>
              <input
                disabled={isCancelled}
                id="eTitle"
                onChange={(e) => setTitle(e.target.value)}
                required
                type="text"
                value={title}
              />
            </div>

            <div className="ev-form-group">
              <label htmlFor="eLocation">Địa điểm tổ chức</label>
              <input
                disabled={isCancelled}
                id="eLocation"
                onChange={(e) => setLocation(e.target.value)}
                required
                type="text"
                value={location}
              />
            </div>

            <div className="ev-form-group">
              <label htmlFor="eDesc">Mô tả sự kiện</label>
              <textarea
                disabled={isCancelled}
                id="eDesc"
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                value={description}
              />
            </div>

            {!isCancelled && (
              <button className="ev-btn-primary" type="submit">
                Lưu cập nhật
              </button>
            )}
          </form>

          {/* Lifecycle Actions Panel */}
          <aside className="ev-org-lifecycle-card">
            <h3>Vòng đời sự kiện</h3>
            <p>Trạng thái hiện tại: <strong>{status}</strong></p>

            <div className="ev-org-lifecycle-steps">
              <div className={`ev-lifecycle-step ${isDraft ? "is-current" : "is-passed"}`}>
                <div className="ev-step-dot" />
                <div>
                  <strong>1. Khởi tạo bản nháp (DRAFT)</strong>
                  <small>Chỉnh sửa nội dung & tạo các hạng vé</small>
                </div>
              </div>

              <div className={`ev-lifecycle-step ${isPublished ? "is-current" : isCancelled ? "is-passed" : ""}`}>
                <div className="ev-step-dot" />
                <div>
                  <strong>2. Xuất bản chính thức (PUBLISHED)</strong>
                  <small>Mở bán vé trên trang chủ và tìm kiếm</small>
                </div>
              </div>

              <div className={`ev-lifecycle-step ${isCancelled ? "is-current" : ""}`}>
                <div className="ev-step-dot" />
                <div>
                  <strong>3. Hủy bỏ sự kiện (CANCELLED)</strong>
                  <small>Đóng bán vé khi có sự cố bất khả kháng</small>
                </div>
              </div>
            </div>

            <div className="ev-org-lifecycle-buttons">
              {isDraft && (
                <button
                  className="ev-btn-primary"
                  onClick={handlePublish}
                  style={{ width: "100%", justifyContent: "center" }}
                  type="button"
                >
                  <LineIcon name="check" />
                  Xuất bản sự kiện (PUBLISH)
                </button>
              )}

              {isPublished && (
                <>
                  <Link
                    className="ev-btn-outline"
                    style={{ width: "100%", justifyContent: "center" }}
                    to={`/events/${event.id}`}
                  >
                    Xem trang hiển thị công khai
                  </Link>
                  <button
                    className="ev-org-btn-danger"
                    onClick={handleCancelEvent}
                    style={{ width: "100%", justifyContent: "center" }}
                    type="button"
                  >
                    <LineIcon name="alert" />
                    Hủy sự kiện (CANCEL)
                  </button>
                </>
              )}

              {isCancelled && (
                <p style={{ color: "var(--eh-error)", fontSize: "12px", margin: 0 }}>
                  Sự kiện này đã bị hủy bỏ và không thể chỉnh sửa thêm.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </OrganizerLayout>
  );
}
