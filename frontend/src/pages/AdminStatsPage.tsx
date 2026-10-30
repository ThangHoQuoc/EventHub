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
    <div className="ev-editorial-page" style={{ padding: "40px 32px 80px", maxWidth: "1180px", margin: "0 auto" }}>
      <header style={{ marginBottom: "24px" }}>
        <span className="ev-eyebrow">
          <LineIcon name="trending" /> Quản trị viên · Báo cáo tài chính & sàn
        </span>
        <h1 style={{ fontSize: "30px", fontWeight: "800", margin: "8px 0 8px", color: "var(--eh-text)" }}>
          Thống kê doanh thu & KPI nền tảng
        </h1>
        <p style={{ color: "var(--eh-muted)", fontSize: "14px", margin: 0 }}>
          Theo dõi tổng quan doanh số bán vé, lượng người dùng và hiệu suất của các sự kiện trên toàn sàn EventHub.
        </p>
      </header>

      <AdminNav />

      <RequestState error={error ? error.message : undefined} loading={loading} onRetry={loadStats} />

      {!loading && stats && (
        <div style={{ display: "grid", gap: "32px" }}>
          {/* 4 thẻ KPI nổi bật */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {/* Card 1: Tổng Doanh Thu */}
            <div
              style={{
                background: "var(--eh-surface)",
                padding: "24px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--eh-border)",
                boxShadow: "var(--eh-shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-muted)" }}>Tổng Doanh Thu Sàn</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "var(--eh-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="bank" />
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-green)", letterSpacing: "-0.5px" }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", marginTop: "6px", display: "block" }}>
                Doanh số từ các đơn đặt chỗ đã xác nhận
              </small>
            </div>

            {/* Card 2: Vé Đã Bán */}
            <div
              style={{
                background: "var(--eh-surface)",
                padding: "24px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--eh-border)",
                boxShadow: "var(--eh-shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-muted)" }}>Vé Đã Phát Hành</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(37,99,235,0.1)", color: "var(--eh-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="ticket" />
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", letterSpacing: "-0.5px" }}>
                {stats.totalTicketsSold.toLocaleString("vi-VN")} <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--eh-muted)" }}>vé</span>
              </div>
              <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", marginTop: "6px", display: "block" }}>
                Tổng số vé đã xuất qua cổng thanh toán
              </small>
            </div>

            {/* Card 3: Sự Kiện Hoạt Động */}
            <div
              style={{
                background: "var(--eh-surface)",
                padding: "24px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--eh-border)",
                boxShadow: "var(--eh-shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-muted)" }}>Sự Kiện Đang Mở Bán</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(245,158,11,0.1)", color: "var(--eh-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="calendar" />
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", letterSpacing: "-0.5px" }}>
                {stats.totalActiveEvents.toLocaleString("vi-VN")} <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--eh-muted)" }}>sự kiện</span>
              </div>
              <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", marginTop: "6px", display: "block" }}>
                Sự kiện trạng thái PUBLISHED trên sàn
              </small>
            </div>

            {/* Card 4: Tổng Người Dùng */}
            <div
              style={{
                background: "var(--eh-surface)",
                padding: "24px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--eh-border)",
                boxShadow: "var(--eh-shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--eh-muted)" }}>Thành Viên Hệ Thống</span>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="user" />
                </div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--eh-text)", letterSpacing: "-0.5px" }}>
                {stats.totalUsers.toLocaleString("vi-VN")} <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--eh-muted)" }}>tài khoản</span>
              </div>
              <small style={{ color: "var(--eh-placeholder)", fontSize: "11px", marginTop: "6px", display: "block" }}>
                Bao gồm Customer, Organizer và Admin
              </small>
            </div>
          </div>

          {/* Bảng Top Sự Kiện Doanh Thu Lớn Nhất */}
          <section
            style={{
              background: "var(--eh-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-sm)",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--eh-text)", margin: "0 0 4px" }}>
                  Top Sự Kiện Có Doanh Thu Cao Nhất
                </h2>
                <p style={{ color: "var(--eh-muted)", fontSize: "13px", margin: 0 }}>
                  Xếp hạng theo tổng doanh thu tiền vé thanh toán thành công
                </p>
              </div>
              <button className="btn btn-secondary" onClick={loadStats} style={{ padding: "8px 16px", fontSize: "13px" }} type="button">
                <LineIcon name="refresh" /> Làm mới
              </button>
            </div>

            {stats.topEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--eh-muted)", fontSize: "14px" }}>
                Chưa có dữ liệu giao dịch sự kiện nào trên hệ thống.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--eh-border)", color: "var(--eh-muted)" }}>
                      <th style={{ padding: "12px 14px", fontWeight: "600" }}>#</th>
                      <th style={{ padding: "12px 14px", fontWeight: "600" }}>Tên Sự Kiện</th>
                      <th style={{ padding: "12px 14px", fontWeight: "600" }}>Thể Loại</th>
                      <th style={{ padding: "12px 14px", fontWeight: "600", textAlign: "right" }}>Vé Đã Bán</th>
                      <th style={{ padding: "12px 14px", fontWeight: "600", textAlign: "right" }}>Tổng Doanh Thu</th>
                      <th style={{ padding: "12px 14px", fontWeight: "600", textAlign: "center" }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topEvents.map((evt, idx) => (
                      <tr key={evt.eventId} style={{ borderBottom: "1px solid var(--eh-border)" }}>
                        <td style={{ padding: "14px", fontWeight: "700", color: idx === 0 ? "var(--eh-orange)" : "var(--eh-muted)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "14px", fontWeight: "700", color: "var(--eh-text)" }}>
                          {evt.title}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span className="badge badge-neutral" style={{ fontSize: "12px" }}>
                            {evt.category}
                          </span>
                        </td>
                        <td style={{ padding: "14px", textAlign: "right", fontWeight: "600", color: "var(--eh-text)" }}>
                          {evt.soldTickets.toLocaleString("vi-VN")} vé
                        </td>
                        <td style={{ padding: "14px", textAlign: "right", fontWeight: "800", color: "var(--eh-green)", fontSize: "15px" }}>
                          {formatCurrency(evt.revenue)}
                        </td>
                        <td style={{ padding: "14px", textAlign: "center" }}>
                          <Link className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} to={`/events/${evt.eventId}`}>
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
