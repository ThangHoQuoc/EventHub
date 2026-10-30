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
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", margin: "8px 0 4px" }}>
              {resource.data?.totalElements ?? visible.length}
            </div>
            <span style={{ fontSize: "12px", color: "var(--eh-green)", fontWeight: "600" }}>
              {publishedCount} sự kiện đang mở bán
            </span>
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
              <span>BẢN NHÁP (DRAFT)</span>
              <LineIcon name="card" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", margin: "8px 0 4px" }}>
              {draftCount}
            </div>
            <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>Chưa công khai ra ngoài</span>
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
              <span>SOÁT VÉ NHANH</span>
              <LineIcon name="shield" />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--eh-text)", margin: "14px 0 8px" }}>
              Cổng Check-in QR
            </div>
            <Link className="ev-text-link" style={{ fontSize: "12px", fontWeight: "700" }} to="/organizer/check-in">
              Mở camera quét vé →
            </Link>
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
              <span>TẠO MỚI</span>
              <LineIcon name="plus" />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--eh-text)", margin: "14px 0 8px" }}>
              Thêm Sự Kiện Mới
            </div>
            <Link className="btn btn-primary" style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex" }} to="/organizer/events/new">
              Bắt đầu ngay
            </Link>
          </div>
        </section>

        {/* Thanh tìm kiếm nhanh bằng ID sự kiện */}
        <section
          style={{
            background: "#faf8f5",
            padding: "20px 24px",
            borderRadius: "var(--radius-xl)",
            border: "1.5px dashed var(--eh-border)",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <form onSubmit={openEvent} style={{ display: "flex", gap: "10px", flex: "1 1 340px" }}>
            <input
              aria-label="Nhập ID sự kiện"
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Nhập nhanh Event ID (ví dụ: e-tech-summit-2026)..."
              style={{ flex: 1, minWidth: "220px" }}
              value={eventId}
            />
            <button className="btn btn-secondary" style={{ whiteSpace: "nowrap" }} type="submit">
              Mở nhanh
            </button>
          </form>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--eh-muted)", fontWeight: "600" }}>Gợi ý mẫu:</span>
            {recentEvents(user?.id ?? "").slice(0, 3).map((item) => (
              <button
                key={item}
                className="btn btn-secondary"
                onClick={() => setEventId(item)}
                style={{ fontSize: "11px", padding: "4px 10px", minHeight: "28px" }}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Danh sách Sự kiện của tôi */}
        <section style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--eh-text)", margin: 0 }}>
              Sự kiện bạn quản lý
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setKeyword(query.trim());
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tiêu đề sự kiện..."
                style={{ width: "240px", padding: "8px 12px", fontSize: "13px" }}
                value={query}
              />
              <button className="btn btn-secondary" style={{ padding: "0 14px" }} type="submit">
                Tìm
              </button>
            </form>
          </div>

          <RequestState error={resource.error} loading={resource.loading} onRetry={resource.reload} />

          {visible.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {visible.map((event) => {
                const isPublished = event.status === "PUBLISHED";
                const isDraft = event.status === "DRAFT";

                return (
                  <article
                    key={event.id}
                    style={{
                      background: "var(--eh-surface)",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--eh-border)",
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
                          background: isPublished ? "var(--eh-green)" : isDraft ? "var(--eh-orange)" : "#666",
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
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenStats(event.id)}
                          style={{ fontSize: "11px", padding: "0 10px", minHeight: "32px", color: "var(--eh-primary)" }}
                          type="button"
                        >
                          <LineIcon name="trending" /> Thống kê
                        </button>
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

      {/* Modal Thống kê Sự Kiện Chi Tiết */}
      {(selectedEventStats || loadingStats || statsError) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--eh-surface)",
              borderRadius: "var(--radius-xl)",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: "11px", marginBottom: "6px" }}>Báo cáo thời gian thực</span>
                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0, color: "var(--eh-text)" }}>
                  {selectedEventStats ? selectedEventStats.title : "Thống kê sự kiện"}
                </h3>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedEventStats(null);
                  setStatsError(null);
                }}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                type="button"
              >
                ✕ Đóng
              </button>
            </div>

            {loadingStats && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--eh-muted)" }}>
                Đang tổng hợp dữ liệu thống kê...
              </div>
            )}

            {statsError && (
              <div style={{ padding: "14px", background: "rgba(239,68,68,0.1)", color: "var(--eh-red)", borderRadius: "8px", fontSize: "14px" }}>
                {statsError}
              </div>
            )}

            {selectedEventStats && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* 3 Metric Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--eh-border)" }}>
                    <div style={{ fontSize: "12px", color: "var(--eh-muted)", fontWeight: "600" }}>Tổng Doanh Thu</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--eh-green)", marginTop: "4px" }}>
                      {formatCurrency(selectedEventStats.totalRevenue)}
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--eh-border)" }}>
                    <div style={{ fontSize: "12px", color: "var(--eh-muted)", fontWeight: "600" }}>Tỷ Lệ Lấp Đầy</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--eh-primary)", marginTop: "4px" }}>
                      {selectedEventStats.occupancyRate}%
                    </div>
                    <small style={{ fontSize: "11px", color: "var(--eh-placeholder)" }}>
                      {selectedEventStats.totalSold}/{selectedEventStats.totalCapacity} vé
                    </small>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--eh-border)" }}>
                    <div style={{ fontSize: "12px", color: "var(--eh-muted)", fontWeight: "600" }}>Check-in Quầy</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--eh-text)", marginTop: "4px" }}>
                      {selectedEventStats.checkedInTickets} <span style={{ fontSize: "12px", fontWeight: "normal", color: "var(--eh-muted)" }}>vé</span>
                    </div>
                    <small style={{ fontSize: "11px", color: "var(--eh-orange)" }}>
                      Waitlist: {selectedEventStats.waitingCount} người
                    </small>
                  </div>
                </div>

                {/* Thanh tiến độ lấp đầy */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    <span>Tiến độ bán vé toàn sự kiện</span>
                    <span>{selectedEventStats.occupancyRate}%</span>
                  </div>
                  <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(100, selectedEventStats.occupancyRate)}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--eh-primary) 0%, var(--eh-green) 100%)",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>

                {/* Chi tiết từng hạng vé */}
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
                    Chi tiết từng loại vé mở bán
                  </h4>

                  {selectedEventStats.ticketTypes.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "var(--eh-muted)" }}>Chưa cấu hình loại vé nào.</div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: "#f1f5f9", color: "var(--eh-muted)", textAlign: "left" }}>
                            <th style={{ padding: "8px 12px", fontWeight: "600" }}>Hạng vé</th>
                            <th style={{ padding: "8px 12px", fontWeight: "600" }}>Đơn giá</th>
                            <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Tổng vé</th>
                            <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Đã bán</th>
                            <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Còn lại</th>
                            <th style={{ padding: "8px 12px", fontWeight: "600", textAlign: "right" }}>Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEventStats.ticketTypes.map((tt) => (
                            <tr key={tt.ticketTypeId} style={{ borderBottom: "1px solid var(--eh-border)" }}>
                              <td style={{ padding: "10px 12px", fontWeight: "700" }}>{tt.name}</td>
                              <td style={{ padding: "10px 12px" }}>{formatCurrency(tt.price)}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right" }}>{tt.quantity}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "var(--eh-green)" }}>
                                {tt.soldQuantity}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "right" }}>{tt.availableQuantity}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700" }}>
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
