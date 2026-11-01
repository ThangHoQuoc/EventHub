import { useEffect, useState, useCallback } from "react";
import { AdminNav } from "../components/layout/AdminNav";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getAdminUsersApi, updateUserStatusApi, type UserAdminDto, type UserStatus } from "../api/admin";
import { formatDateTime } from "../utils/format";

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal Khóa/Mở khóa
  const [targetUser, setTargetUser] = useState<UserAdminDto | null>(null);
  const [newStatus, setNewStatus] = useState<UserStatus>("ACTIVE");
  const [updating, setUpdating] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; success: boolean } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsersApi({
        keyword: keyword.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        size: 10,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [keyword, role, status, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenStatusModal = (user: UserAdminDto, nextStatus: UserStatus) => {
    setTargetUser(user);
    setNewStatus(nextStatus);
    setActionMsg(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetUser) return;
    setUpdating(true);
    setActionMsg(null);
    try {
      await updateUserStatusApi(targetUser.id, newStatus);
      setActionMsg({
        text: `Đã cập nhật trạng thái tài khoản ${targetUser.email} thành ${newStatus}!`,
        success: true,
      });
      setTargetUser(null);
      await loadUsers();
    } catch (err: unknown) {
      setActionMsg({
        text: err instanceof Error ? err.message : "Cập nhật trạng thái thất bại.",
        success: false,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="eh-admin-shell">
      <header className="eh-admin-header">
        <div>
          <span className="eh-admin-kicker">
            <LineIcon name="user" /> Quản trị viên · Quản lý tài khoản
          </span>
          <h1 className="eh-admin-title">Quản lý người dùng hệ thống</h1>
          <p className="eh-admin-sub">
            Tra cứu, phân loại tài khoản theo vai trò và kiểm soát quyền truy cập của người dùng trên toàn sàn.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={loadUsers}
          style={{ fontSize: "13px", padding: "0 18px", minHeight: "40px", fontWeight: "700" }}
          type="button"
        >
          <LineIcon name="refresh" /> Tải lại danh sách
        </button>
      </header>

      <AdminNav />

      {/* Thông báo thao tác */}
      {actionMsg && (
        <div
          role="status"
          style={{
            padding: "14px 20px",
            borderRadius: "var(--radius-lg)",
            fontSize: "13px",
            fontWeight: "700",
            background: actionMsg.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${actionMsg.success ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
            color: actionMsg.success ? "#059669" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LineIcon name={actionMsg.success ? "check" : "alert"} />
          {actionMsg.text}
        </div>
      )}

      {/* Thanh bộ lọc */}
      <section
        style={{
          background: "var(--eh-surface)",
          padding: "20px 24px",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--eh-border)",
          boxShadow: "var(--eh-shadow-xs)",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 260px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-keyword" style={{ fontSize: "12px", fontWeight: "800", color: "var(--eh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Tìm kiếm người dùng
          </label>
          <input
            id="usr-keyword"
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo email, họ tên, số điện thoại..."
            style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", fontSize: "13px" }}
            value={keyword}
          />
        </div>

        <div style={{ width: "180px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-role" style={{ fontSize: "12px", fontWeight: "800", color: "var(--eh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Vai trò (Role)
          </label>
          <select
            id="usr-role"
            onChange={(e) => {
              setRole(e.target.value);
              setPage(0);
            }}
            style={{ height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 12px", fontSize: "13px" }}
            value={role}
          >
            <option value="">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách mua vé (CUSTOMER)</option>
            <option value="ORGANIZER">Nhà tổ chức (ORGANIZER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        <div style={{ width: "180px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-status" style={{ fontSize: "12px", fontWeight: "800", color: "var(--eh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Trạng thái
          </label>
          <select
            id="usr-status"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            style={{ height: "42px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 12px", fontSize: "13px" }}
            value={status}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="BANNED">Đã bị khóa (BANNED)</option>
            <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setKeyword("");
            setRole("");
            setStatus("");
            setPage(0);
          }}
          style={{ height: "42px", padding: "0 18px", fontWeight: "700" }}
          type="button"
        >
          Đặt lại lọc
        </button>
      </section>

      <RequestState error={error || undefined} loading={loading} onRetry={loadUsers} />

      {/* Bảng danh sách người dùng */}
      {!loading && (
        <section className="eh-admin-table-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "var(--eh-text-muted)", fontWeight: "600" }}>
              Hiển thị {users.length} trên tổng số <strong>{totalElements}</strong> tài khoản
            </span>
            <span style={{ fontSize: "12px", color: "var(--eh-brand)", fontWeight: "700" }}>
              Phân quyền theo chuẩn RBAC
            </span>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--eh-text-muted)", fontSize: "14px" }}>
              Không tìm thấy người dùng nào phù hợp với điều kiện lọc.
            </div>
          ) : (
            <div className="eh-admin-table-wrap">
              <table className="eh-admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tham gia</th>
                    <th style={{ textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: "800", color: "var(--eh-text-primary)" }}>{u.fullName || "Chưa đặt tên"}</div>
                        <div style={{ fontSize: "12px", color: "var(--eh-text-muted)", marginTop: "2px" }}>{u.email}</div>
                      </td>
                      <td style={{ color: "var(--eh-text-secondary)" }}>
                        {u.phone || "—"}
                      </td>
                      <td>
                        <span
                          className={`eh-role-badge ${
                            u.role === "ADMIN" ? "is-admin" : u.role === "ORGANIZER" ? "is-organizer" : "is-customer"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`eh-user-status-pill ${u.status === "ACTIVE" ? "is-active" : "is-locked"}`}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                          {u.status === "ACTIVE" ? "Đang hoạt động" : u.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--eh-text-muted)", fontSize: "13px" }}>
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {u.role !== "ADMIN" && (
                          u.status === "ACTIVE" ? (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenStatusModal(u, "BANNED")}
                              style={{ padding: "5px 12px", fontSize: "11px", color: "#dc2626", borderColor: "#fecaca", fontWeight: "700" }}
                              type="button"
                            >
                              Khóa tài khoản
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenStatusModal(u, "ACTIVE")}
                              style={{ padding: "5px 12px", fontSize: "11px", color: "#059669", borderColor: "#a7f3d0", fontWeight: "700" }}
                              type="button"
                            >
                              Mở khóa
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", paddingTop: "14px" }}>
              <button
                className="btn btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "700" }}
                type="button"
              >
                Trang trước
              </button>
              <span style={{ padding: "0 12px", fontSize: "13px", color: "var(--eh-text-muted)", fontWeight: "600" }}>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "700" }}
                type="button"
              >
                Trang sau
              </button>
            </div>
          )}
        </section>
      )}

      {/* Modal Xác nhận đổi trạng thái */}
      {targetUser && (
        <div className="eh-modal-backdrop" onClick={() => setTargetUser(null)}>
          <div className="eh-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 12px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              {newStatus === "BANNED" ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
            </h3>
            <p style={{ color: "var(--eh-text-secondary)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
              Bạn có chắc chắn muốn chuyển trạng thái tài khoản <strong>{targetUser.email}</strong> ({targetUser.fullName}) sang <strong>{newStatus}</strong>?
              {newStatus === "BANNED" && " Người dùng này sẽ bị chấm dứt phiên làm việc và không thể đặt vé hoặc đăng nhập."}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                disabled={updating}
                onClick={() => setTargetUser(null)}
                style={{ fontWeight: "700" }}
                type="button"
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-primary"
                disabled={updating}
                onClick={handleConfirmStatusChange}
                style={{
                  background: newStatus === "BANNED" ? "#dc2626" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: newStatus === "BANNED" ? "0 4px 14px rgba(220, 38, 38, 0.35)" : "0 4px 14px rgba(16, 185, 129, 0.35)",
                  fontWeight: "800",
                }}
                type="button"
              >
                {updating ? "Đang xử lý..." : "Xác nhận thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
