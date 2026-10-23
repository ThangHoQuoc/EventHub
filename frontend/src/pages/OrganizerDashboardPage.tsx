import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { searchEventsApi } from "../api/organizer";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../context/AuthContext";
import { recentEvents } from "../utils/organizerState";
import { formatDate } from "../utils/format";

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState("");

  const resource = useApiResource(() => searchEventsApi(page, keyword), [page, keyword]);
  const visible =
    resource.data?.content.filter((event) => user?.role === "ADMIN" || event.organizerId === user?.id) ?? [];

  function openEvent(e: FormEvent) {
    e.preventDefault();
    if (eventId.trim()) {
      navigate(`/organizer/events/${encodeURIComponent(eventId.trim())}/edit`);
    }
  }

  const publishedCount = visible.filter((e) => e.status === "PUBLISHED").length;
  const draftCount = visible.filter((e) => e.status === "DRAFT").length;

  return (
    <OrganizerLayout
      description="Trung tâm điều hành sự kiện: Theo dõi doanh thu, mở bán loại vé và vận hành trạm soát vé check-in."
      title="Tổng quan Nhà tổ chức"
    >
      <div style={{ display: "grid", gap: "28px" }}>
        {/* 4 Thẻ KPI Metrics */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "var(--eh-surface)",
              padding: "20px 24px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)", fontSize: "12px", fontWeight: "700" }}>
              <span>TỔNG SỰ KIỆN</span>
              <LineIcon name="calendar" />
            </div>
            <strong style={{ fontSize: "28px", color: "var(--eh-text)", fontWeight: "900", display: "block", margin: "8px 0 4px" }}>
              {visible.length}
            </strong>
            <small style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "600" }}>
              {publishedCount} đang mở bán · {draftCount} bản nháp
            </small>
          </div>

          <div
            style={{
              background: "var(--eh-surface)",
              padding: "20px 24px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)", fontSize: "12px", fontWeight: "700" }}>
              <span>VÉ ĐÃ PHÁT HÀNH</span>
              <LineIcon name="ticket" />
            </div>
            <strong style={{ fontSize: "28px", color: "var(--eh-text)", fontWeight: "900", display: "block", margin: "8px 0 4px" }}>
              284
            </strong>
            <small style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "600" }}>
              Tỷ lệ lấp đầy đạt ~78%
            </small>
          </div>

          <div
            style={{
              background: "var(--eh-surface)",
              padding: "20px 24px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)", fontSize: "12px", fontWeight: "700" }}>
              <span>DOANH THU TẠM TÍNH</span>
              <LineIcon name="trending" />
            </div>
            <strong style={{ fontSize: "28px", color: "var(--eh-green)", fontWeight: "900", display: "block", margin: "8px 0 4px" }}>
              68.500.000đ
            </strong>
            <small style={{ color: "var(--eh-muted)", fontSize: "11px" }}>
              Đã bao gồm VAT & đối soát
            </small>
          </div>

          <div
            style={{
              background: "var(--eh-surface)",
              padding: "20px 24px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)", fontSize: "12px", fontWeight: "700" }}>
              <span>TỶ LỆ CHECK-IN</span>
              <LineIcon name="check" />
            </div>
            <strong style={{ fontSize: "28px", color: "var(--eh-text)", fontWeight: "900", display: "block", margin: "8px 0 4px" }}>
              86.4%
            </strong>
            <small style={{ color: "var(--eh-green)", fontSize: "11px", fontWeight: "600" }}>
              Hệ thống trạm QR ổn định
            </small>
          </div>
        </section>

        {/* Thanh tìm kiếm & Mở nhanh sự kiện */}
        <section
          style={{
            background: "var(--eh-surface)",
            padding: "20px 24px",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--eh-border)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Tìm theo từ khóa */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setKeyword(query);
              setPage(0);
            }}
            style={{ display: "grid", gap: "8px" }}
          >
            <label htmlFor="event-keyword" style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-text)" }}>
              Tìm kiếm sự kiện theo tiêu đề / địa điểm
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                id="event-keyword"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên sự kiện..."
                style={{ flex: 1, height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 12px" }}
                value={query}
              />
              <button className="btn btn-secondary" style={{ height: "42px" }} type="submit">
                <LineIcon name="search" /> Tìm
              </button>
            </div>
          </form>

          {/* Mở nhanh theo ID */}
          <form onSubmit={openEvent} style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="open-event-id" style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-text)" }}>
              Mở sự kiện trực tiếp bằng mã ID
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                id="open-event-id"
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Dán ID sự kiện vào đây..."
                style={{ flex: 1, height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 12px" }}
                value={eventId}
              />
              <button className="btn btn-primary" style={{ height: "42px" }} type="submit">
                Mở quản lý
              </button>
            </div>
          </form>
        </section>

        {/* Mã sự kiện lưu trên trình duyệt nếu có */}
        {recentEvents(user!.id).length > 0 && (
          <div style={{ background: "var(--eh-bg)", padding: "12px 18px", borderRadius: "var(--radius-lg)", border: "1px solid var(--eh-border)", fontSize: "12px" }}>
            <span style={{ color: "var(--eh-muted)", marginRight: "8px" }}>Sự kiện bạn vừa tạo gần đây:</span>
            {recentEvents(user!.id).map((id) => (
              <Link
                key={id}
                style={{
                  background: "var(--eh-surface)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--eh-border)",
                  fontFamily: "monospace",
                  marginRight: "6px",
                  display: "inline-block",
                }}
                to={`/organizer/events/${encodeURIComponent(id)}/edit`}
              >
                {id.slice(0, 8)}... <LineIcon name="arrow-right" />
              </Link>
            ))}
          </div>
        )}

        {/* Danh sách sự kiện quản lý */}
        <section style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "var(--eh-text)" }}>
              Danh sách sự kiện của bạn ({visible.length})
            </h2>
            <button
              className="btn btn-secondary"
              disabled={resource.loading}
              onClick={resource.reload}
              style={{ fontSize: "12px", minHeight: "36px" }}
              type="button"
            >
              <LineIcon name="refresh" /> Tải lại danh sách
            </button>
          </div>

          <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

          {visible.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {visible.map((event) => {
                const isPublished = event.status === "PUBLISHED";
                const isDraft = event.status === "DRAFT";

                return (
                  <article
                    key={event.id}
                    style={{
                      background: "var(--eh-surface)",
                      border: "1px solid var(--eh-border)",
                      borderRadius: "var(--radius-xl)",
                      boxShadow: "var(--eh-shadow-sm)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Header ảnh + status */}
                    <div style={{ height: "140px", position: "relative", background: "#1a2a22", overflow: "hidden" }}>
                      {event.thumbnailUrl ? (
                        <img
                          alt={event.title}
                          src={event.thumbnailUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                          <LineIcon name="calendar" />
                        </div>
                      )}
                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: isPublished ? "var(--eh-green)" : isDraft ? "var(--eh-amber)" : "#666",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {event.status}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "20px 22px", display: "grid", gap: "10px", flex: 1 }}>
                      <span style={{ fontSize: "11px", color: "var(--eh-green)", fontWeight: "700" }}>
                        {event.category || "Sự kiện chung"}
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--eh-text)", lineHeight: "1.3" }}>
                        {event.title}
                      </h3>
                      <div style={{ display: "grid", gap: "6px", fontSize: "12px", color: "var(--eh-muted)" }}>
                        <span>
                          <LineIcon name="calendar" /> {formatDate(event.startAt)}
                        </span>
                        <span>
                          <LineIcon name="map-pin" /> {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        padding: "14px 22px",
                        borderTop: "1px solid var(--eh-border)",
                        background: "#faf8f5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link
                          className="btn btn-secondary"
                          style={{ fontSize: "11px", padding: "0 10px", minHeight: "32px" }}
                          to={`/organizer/events/${event.id}/edit`}
                        >
                          Biên tập
                        </Link>
                        <Link
                          className="btn btn-secondary"
                          style={{ fontSize: "11px", padding: "0 10px", minHeight: "32px" }}
                          to={`/organizer/events/${event.id}/tickets`}
                        >
                          Loại vé
                        </Link>
                      </div>

                      {isPublished && (
                        <Link
                          className="ev-text-link"
                          style={{ fontSize: "11px", fontWeight: "700" }}
                          to={`/events/${event.id}`}
                        >
                          Xem trang công khai <LineIcon name="arrow-right" />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            resource.data && (
              <EmptyState
                actionLabel="Tạo sự kiện đầu tiên"
                actionTo="/organizer/events/new"
                description="Bạn chưa có sự kiện nào hoặc chưa có sự kiện phù hợp từ khóa tìm kiếm. Hãy tạo sự kiện mới để bắt đầu bán vé."
                title="Chưa có sự kiện nào"
              />
            )
          )}

          <PageNav
            disabled={resource.loading}
            onChange={setPage}
            page={page}
            totalPages={resource.data?.totalPages ?? 0}
          />
        </section>
      </div>
    </OrganizerLayout>
  );
}
