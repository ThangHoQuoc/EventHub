import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminNav } from "../components/layout/AdminNav";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getAdminPlatformStatsApi, type AdminPlatformStatsDto } from "../api/admin";
import { formatCurrency } from "../utils/format";

export function AdminStatsPage() {
  const [stats, setStats] = useState<AdminPlatformStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPlatformStatsApi();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không thể tải số liệu thống kê sàn."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="eh-admin-shell">
      <header className="eh-admin-header">
        <div>
          <span className="eh-admin-kicker">
            <LineIcon name="trending" /> Báo cáo tài chính & sàn giao dịch
          </span>
          <h1 className="eh-admin-title">Thống kê doanh thu & KPI nền tảng</h1>
          <p className="eh-admin-sub">
            Theo dõi tổng quan doanh số bán vé, lượng người dùng và hiệu suất của các sự kiện trên toàn sàn EventHub.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={loadStats}
          style={{ fontSize: "13px", padding: "0 18px", minHeight: "40px", fontWeight: "700" }}
          type="button"
        >
          <LineIcon name="refresh" /> Làm mới dữ liệu
        </button>
      </header>

      <AdminNav />

      <RequestState error={error ? error.message : undefined} loading={loading} onRetry={loadStats} />

      {!loading && stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* 4 Thẻ KPI Metrics lớn */}
          <div className="eh-org-kpi-grid">
            {/* Card 1: Tổng Doanh Thu */}
            <div className="eh-org-kpi-card">
              <div className="eh-org-kpi-top">
                <span>Tổng Doanh Thu Sàn</span>
                <div className="eh-org-kpi-icon is-emerald">
                  <LineIcon name="bank" />
                </div>
              </div>
              <div className="eh-org-kpi-val" style={{ color: "#059669" }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <span className="eh-org-kpi-sub">
                Doanh số từ các đơn đã xác nhận
              </span>
            </div>

            {/* Card 2: Vé Đã Bán */}
            <div className="eh-org-kpi-card">
              <div className="eh-org-kpi-top">
                <span>Vé Đã Phát Hành</span>
                <div className="eh-org-kpi-icon is-indigo">
                  <LineIcon name="ticket" />
                </div>
              </div>
              <div className="eh-org-kpi-val">
                {stats.totalTicketsSold.toLocaleString("vi-VN")}{" "}
                <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--eh-text-muted)" }}>vé</span>
              </div>
              <span className="eh-org-kpi-sub">
                Tổng vé đã xuất qua thanh toán
              </span>
            </div>

            {/* Card 3: Sự Kiện Hoạt Động */}
            <div className="eh-org-kpi-card">
              <div className="eh-org-kpi-top">
                <span>Sự Kiện Đang Bán</span>
                <div className="eh-org-kpi-icon is-amber">
                  <LineIcon name="calendar" />
                </div>
              </div>
              <div className="eh-org-kpi-val" style={{ color: "#d97706" }}>
                {stats.totalActiveEvents.toLocaleString("vi-VN")}{" "}
                <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--eh-text-muted)" }}>sự kiện</span>
              </div>
              <span className="eh-org-kpi-sub">
                Trạng thái PUBLISHED trực tuyến
              </span>
            </div>

            {/* Card 4: Tổng Người Dùng */}
            <div className="eh-org-kpi-card">
              <div className="eh-org-kpi-top">
                <span>Thành Viên Hệ Thống</span>
                <div className="eh-org-kpi-icon is-rose">
                  <LineIcon name="user" />
                </div>
              </div>
              <div className="eh-org-kpi-val">
                {stats.totalUsers.toLocaleString("vi-VN")}{" "}
                <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--eh-text-muted)" }}>tài khoản</span>
              </div>
              <span className="eh-org-kpi-sub">
                Khách hàng, Ban tổ chức & Admin
              </span>
            </div>
          </div>

          {/* Bảng Top Sự Kiện Doanh Thu Lớn Nhất */}
          <section className="eh-admin-table-card">
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--eh-text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Top Sự Kiện Có Doanh Thu Cao Nhất
              </h2>
              <p style={{ color: "var(--eh-text-muted)", fontSize: "13px", margin: 0 }}>
                Xếp hạng theo tổng doanh thu tiền vé thanh toán thành công trên toàn hệ thống.
              </p>
            </div>

            {stats.topEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--eh-text-muted)", fontSize: "14px" }}>
                Chưa có dữ liệu giao dịch sự kiện nào trên hệ thống.
              </div>
            ) : (
              <div className="eh-admin-table-wrap">
                <table className="eh-admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Tên Sự Kiện</th>
                      <th>Thể Loại</th>
                      <th style={{ textAlign: "right" }}>Vé Đã Bán</th>
                      <th style={{ textAlign: "right" }}>Tổng Doanh Thu</th>
                      <th style={{ textAlign: "center", width: "100px" }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topEvents.map((evt, idx) => (
                      <tr key={evt.eventId}>
                        <td style={{ fontWeight: "800", color: idx === 0 ? "#d97706" : "var(--eh-text-muted)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ fontWeight: "800", color: "var(--eh-text-primary)" }}>
                          {evt.title}
                        </td>
                        <td>
                          <span className="eh-role-badge is-customer" style={{ fontSize: "11px" }}>
                            {evt.category}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700", color: "var(--eh-text-primary)" }}>
                          {evt.soldTickets.toLocaleString("vi-VN")} vé
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "900", color: "#059669", fontSize: "15px" }}>
                          {formatCurrency(evt.revenue)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Link
                            className="btn btn-secondary"
                            style={{ padding: "4px 12px", fontSize: "12px", fontWeight: "700" }}
                            to={`/events/${evt.eventId}`}
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
