import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
import { PageNav } from "../components/ui/PageNav";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { getMyEventsApi } from "../api/organizer";
import { getEventStatsApi, type EventStatsDto } from "../api/admin";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../context/AuthContext";
import { recentEvents } from "../utils/organizerState";
import { formatDate, formatCurrency } from "../utils/format";

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [eventId, setEventId] = useState("");

  // Stats Modal state
  const [selectedEventStats, setSelectedEventStats] = useState<EventStatsDto | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const resource = useApiResource(() => getMyEventsApi({ page, keyword }), [page, keyword]);
  const visible =
    resource.data?.content.filter((event) => user?.role === "ADMIN" || event.organizerId === user?.id) ?? [];

  function openEvent(e: FormEvent) {
    e.preventDefault();
    if (eventId.trim()) {
      navigate(`/organizer/events/${encodeURIComponent(eventId.trim())}/edit`);
    }
  }

  const handleOpenStats = async (id: string) => {
    setLoadingStats(true);
    setStatsError(null);
    setSelectedEventStats(null);
    try {
      const data = await getEventStatsApi(id);
      setSelectedEventStats(data);
    } catch (err: unknown) {
      setStatsError(err instanceof Error ? err.message : "Không thể tải số liệu thống kê sự kiện.");
    } finally {
      setLoadingStats(false);
    }
  };

  const publishedCount = visible.filter((e) => e.status === "PUBLISHED").length;
  const draftCount = visible.filter((e) => e.status === "DRAFT").length;

  return (
    <OrganizerLayout
      description="Trung tâm điều hành sự kiện: Theo dõi hiệu suất bán vé, kiểm soát doanh thu thời gian thực và vận hành trạm soát vé check-in."
      title="Tổng quan & Quản lý Sự kiện"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* 4 Thẻ KPI Metrics */}
        <section aria-label="Thống kê tổng quan ban tổ chức" className="eh-org-kpi-grid">
          <div className="eh-org-kpi-card">
            <div className="eh-org-kpi-top">
              <span>Tổng số sự kiện</span>
              <div className="eh-org-kpi-icon is-indigo">
                <LineIcon name="calendar" />
              </div>
            </div>
            <div className="eh-org-kpi-val">
              {resource.data?.totalElements ?? visible.length}
            </div>
            <span className="eh-org-kpi-sub">
              Sự kiện trong danh mục quản lý
            </span>
          </div>

          <div className="eh-org-kpi-card">
            <div className="eh-org-kpi-top">
              <span>Đang mở bán vé</span>
              <div className="eh-org-kpi-icon is-emerald">
                <LineIcon name="trending" />
              </div>
            </div>
            <div className="eh-org-kpi-val" style={{ color: "#059669" }}>
              {publishedCount}
            </div>
            <span className="eh-org-kpi-sub" style={{ color: "#059669" }}>
              Đang tiếp nhận khán giả đặt vé
            </span>
          </div>

          <div className="eh-org-kpi-card">
            <div className="eh-org-kpi-top">
              <span>Bản nháp (Draft)</span>
              <div className="eh-org-kpi-icon is-amber">
                <LineIcon name="card" />
              </div>
            </div>
            <div className="eh-org-kpi-val" style={{ color: "#d97706" }}>
              {draftCount}
            </div>
            <span className="eh-org-kpi-sub">
              Chưa công khai ra bên ngoài
            </span>
          </div>

          <div className="eh-org-kpi-card">
            <div className="eh-org-kpi-top">
              <span>Cổng Soát Vé</span>
              <div className="eh-org-kpi-icon is-rose">
                <LineIcon name="shield" />
              </div>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--eh-text-primary)", margin: "4px 0" }}>
              Trạm Check-in QR
            </div>
            <Link
              style={{ fontSize: "12px", fontWeight: "800", color: "var(--eh-brand)", textDecoration: "none" }}
              to="/organizer/check-in"
            >
              Mở camera quét vé →
            </Link>
          </div>
        </section>

        {/* Thanh tìm kiếm nhanh bằng ID sự kiện */}
        <section aria-label="Tìm nhanh sự kiện bằng mã" className="eh-org-quick-search">
          <form className="eh-quick-form" onSubmit={openEvent}>
            <input
              aria-label="Nhập ID sự kiện"
              className="eh-quick-input"
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Nhập nhanh Event ID (ví dụ: e-tech-summit-2026)..."
              value={eventId}
            />
            <button
              className="btn btn-secondary"
              style={{ whiteSpace: "nowrap", padding: "0 18px", fontWeight: "700" }}
              type="submit"
            >
              Mở nhanh
            </button>
          </form>

          <div className="eh-quick-hints">
            <span style={{ fontWeight: "700" }}>Gợi ý mẫu:</span>
            {recentEvents(user?.id ?? "").slice(0, 3).map((item) => (
              <button
                key={item}
                className="eh-hint-pill"
                onClick={() => setEventId(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Danh sách Sự kiện của tôi */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--eh-text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Danh sách sự kiện bạn quản lý
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--eh-text-muted)" }}>
                Theo dõi tình trạng mở bán, biên tập nội dung và truy cập báo cáo chi tiết từng sự kiện.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setKeyword(query.trim());
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                className="eh-quick-input"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tiêu đề sự kiện..."
                style={{ width: "240px", padding: "8px 14px", minWidth: 0 }}
                value={query}
              />
              <button
                className="btn btn-secondary"
                style={{ padding: "0 16px", fontWeight: "700" }}
                type="submit"
              >
                Tìm
              </button>
            </form>
          </div>

          <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

          {visible.length > 0 ? (
            <div className="eh-org-events-grid">
              {visible.map((event) => {
                const isPublished = event.status === "PUBLISHED";
                const isDraft = event.status === "DRAFT";

                return (
                  <article className="eh-org-event-card" key={event.id}>
                    {/* Header ảnh thumbnail + Status Badge */}
                    <div className="eh-org-thumb-wrap">
                      <img
                        alt={event.title}
                        className="eh-org-thumb-img"
                        loading="lazy"
                        src={
                          event.thumbnailUrl ||
                          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"
                        }
                      />
                      <span
                        className={`eh-org-status-badge ${
                          isPublished
                            ? "is-published"
                            : isDraft
                            ? "is-draft"
                            : "is-cancelled"
                        }`}
                      >
                        {event.status === "PUBLISHED"
                          ? "Đang mở bán"
                          : event.status === "DRAFT"
                          ? "Bản nháp"
                          : event.status}
                      </span>
                    </div>

                    {/* Thân thẻ sự kiện */}
                    <div className="eh-org-event-body">
                      <span className="eh-org-event-cat">
                        {event.category || "Sự kiện chung"}
                      </span>
                      <h3 className="eh-org-event-title">{event.title}</h3>
                      <div className="eh-org-event-meta">
                        <span>
                          <LineIcon name="calendar" /> {formatDate(event.startAt)}
                        </span>
                        <span>
                          <LineIcon name="map-pin" /> {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Chân thẻ: Các nút hành động */}
                    <div className="eh-org-event-foot">
                      <div className="eh-org-actions-group">
                        <Link
                          className="eh-org-btn-action"
                          to={`/organizer/events/${event.id}/edit`}
                        >
                          Biên tập
                        </Link>
                        <Link
                          className="eh-org-btn-action"
                          to={`/organizer/events/${event.id}/tickets`}
                        >
                          Loại vé
                        </Link>
                        <button
                          className="eh-org-btn-action is-stats"
                          onClick={() => handleOpenStats(event.id)}
                          type="button"
                        >
                          <LineIcon name="trending" /> Thống kê
                        </button>
                      </div>

                      {isPublished && (
                        <Link
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "var(--eh-brand)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                          }}
                          to={`/events/${event.id}`}
                        >
                          Trang vé <LineIcon name="arrow-right" />
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

      {/* Modal Thống kê Sự Kiện Thời Gian Thực */}
      {(selectedEventStats || loadingStats || statsError) && (
        <div className="eh-modal-backdrop" onClick={() => { setSelectedEventStats(null); setStatsError(null); }}>
          <div className="eh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="eh-modal-head">
              <div>
                <span className="eh-modal-kicker">
                  <LineIcon name="sparkles" /> Báo cáo thời gian thực
                </span>
                <h3>
                  {selectedEventStats ? selectedEventStats.title : "Thống kê sự kiện"}
                </h3>
              </div>
              <button
                aria-label="Đóng bảng thống kê"
                className="eh-modal-close"
                onClick={() => {
                  setSelectedEventStats(null);
                  setStatsError(null);
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            {loadingStats && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--eh-text-muted)" }}>
                Đang tổng hợp dữ liệu thời gian thực từ cơ sở dữ liệu...
              </div>
            )}

            {statsError && (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {statsError}
              </div>
            )}

            {selectedEventStats && (
              <div>
                {/* 3 Metric Cards */}
                <div className="eh-stats-kpi-3">
                  <div className="eh-stats-card-mini is-revenue">
                    <small>Tổng Doanh Thu</small>
                    <strong>{formatCurrency(selectedEventStats.totalRevenue)}</strong>
                  </div>

                  <div className="eh-stats-card-mini is-rate">
                    <small>Tỷ Lệ Lấp Đầy</small>
                    <strong>{selectedEventStats.occupancyRate}%</strong>
                    <span style={{ fontSize: "11px", color: "var(--eh-text-muted)", marginTop: "4px", display: "block" }}>
                      {selectedEventStats.totalSold}/{selectedEventStats.totalCapacity} vé đã bán
                    </span>
                  </div>

                  <div className="eh-stats-card-mini">
                    <small>Check-in Cổng</small>
                    <strong>
                      {selectedEventStats.checkedInTickets}{" "}
                      <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--eh-text-muted)" }}>vé</span>
                    </strong>
                    <span style={{ fontSize: "11px", color: "#d97706", marginTop: "4px", display: "block", fontWeight: "700" }}>
                      Waitlist: {selectedEventStats.waitingCount} người chờ
                    </span>
                  </div>
                </div>

                {/* Thanh tiến độ lấp đầy */}
                <div className="eh-progress-wrap">
                  <div className="eh-progress-labels">
                    <span>Tiến độ bán vé toàn sự kiện</span>
                    <span>{selectedEventStats.occupancyRate}%</span>
                  </div>
                  <div className="eh-progress-track">
                    <div
                      className="eh-progress-fill"
                      style={{ width: `${Math.min(100, selectedEventStats.occupancyRate)}%` }}
                    />
                  </div>
                </div>

                {/* Chi tiết từng hạng vé */}
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text-primary)" }}>
                    Chi tiết từng loại vé mở bán
                  </h4>

                  {selectedEventStats.ticketTypes.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "var(--eh-text-muted)" }}>
                      Chưa có dữ liệu phân bổ loại vé.
                    </div>
                  ) : (
                    <div className="eh-stats-table-wrap">
                      <table className="eh-stats-table">
                        <thead>
                          <tr>
                            <th>Hạng vé</th>
                            <th>Đơn giá</th>
                            <th style={{ textAlign: "right" }}>Tổng vé</th>
                            <th style={{ textAlign: "right" }}>Đã bán</th>
                            <th style={{ textAlign: "right" }}>Còn lại</th>
                            <th style={{ textAlign: "right" }}>Lấp đầy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEventStats.ticketTypes.map((tt) => (
                            <tr key={tt.ticketTypeId}>
                              <td style={{ fontWeight: "700" }}>{tt.name}</td>
                              <td>{formatCurrency(tt.price)}</td>
                              <td style={{ textAlign: "right" }}>{tt.quantity}</td>
                              <td style={{ textAlign: "right", fontWeight: "800", color: "#059669" }}>
                                {tt.soldQuantity}
                              </td>
                              <td style={{ textAlign: "right" }}>{tt.availableQuantity}</td>
                              <td style={{ textAlign: "right", fontWeight: "800" }}>
                                {tt.occupancyRate}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
}
