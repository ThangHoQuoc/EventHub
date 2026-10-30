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
    <div className="ev-editorial-page" style={{ padding: "40px 32px 80px", maxWidth: "1180px", margin: "0 auto" }}>
      <header style={{ marginBottom: "24px" }}>
        <span className="ev-eyebrow">
          <LineIcon name="user" /> Quản trị viên · Quản lý tài khoản
        </span>
        <h1 style={{ fontSize: "30px", fontWeight: "800", margin: "8px 0 8px", color: "var(--eh-text)" }}>
          Quản lý người dùng hệ thống
        </h1>
        <p style={{ color: "var(--eh-muted)", fontSize: "14px", margin: 0 }}>
          Tra cứu, phân loại tài khoản theo vai trò và kiểm soát quyền truy cập của người dùng trên toàn sàn.
        </p>
      </header>

      <AdminNav />

      {/* Thông báo thao tác */}
      {actionMsg && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            marginBottom: "20px",
            background: actionMsg.success ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${actionMsg.success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: actionMsg.success ? "var(--eh-green)" : "var(--eh-red)",
          }}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Thanh bộ lọc */}
      <section
        style={{
          background: "var(--eh-surface)",
          padding: "20px 24px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--eh-border)",
          marginBottom: "24px",
          boxShadow: "var(--eh-shadow-sm)",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 240px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-keyword" style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-muted)" }}>
            Tìm kiếm người dùng
          </label>
          <input
            id="usr-keyword"
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo email, họ tên, số điện thoại..."
            style={{ width: "100%" }}
            value={keyword}
          />
        </div>

        <div style={{ width: "160px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-role" style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-muted)" }}>
            Vai trò (Role)
          </label>
          <select
            id="usr-role"
            onChange={(e) => {
              setRole(e.target.value);
              setPage(0);
            }}
            value={role}
          >
            <option value="">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách mua vé (CUSTOMER)</option>
            <option value="ORGANIZER">Nhà tổ chức (ORGANIZER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        <div style={{ width: "160px", display: "grid", gap: "6px" }}>
          <label htmlFor="usr-status" style={{ fontSize: "12px", fontWeight: "700", color: "var(--eh-muted)" }}>
            Trạng thái
          </label>
          <select
            id="usr-status"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
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
          style={{ height: "42px", padding: "0 18px" }}
          type="button"
        >
          Đặt lại
        </button>
      </section>

      <RequestState error={error || undefined} loading={loading} onRetry={loadUsers} />

      {/* Bảng danh sách người dùng */}
      {!loading && (
        <section
          style={{
            background: "var(--eh-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--eh-border)",
            boxShadow: "var(--eh-shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--eh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "var(--eh-muted)", fontWeight: "600" }}>
              Hiển thị {users.length} trên tổng số <strong>{totalElements}</strong> người dùng
            </span>
            <button className="btn btn-secondary" onClick={loadUsers} style={{ padding: "6px 14px", fontSize: "12px" }} type="button">
              <LineIcon name="refresh" /> Tải lại
            </button>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--eh-muted)", fontSize: "14px" }}>
              Không tìm thấy người dùng nào phù hợp với điều kiện lọc.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--eh-border)", color: "var(--eh-muted)" }}>
                    <th style={{ padding: "12px 18px", fontWeight: "600" }}>Người dùng</th>
                    <th style={{ padding: "12px 18px", fontWeight: "600" }}>Số điện thoại</th>
                    <th style={{ padding: "12px 18px", fontWeight: "600" }}>Vai trò</th>
                    <th style={{ padding: "12px 18px", fontWeight: "600" }}>Trạng thái</th>
                    <th style={{ padding: "12px 18px", fontWeight: "600" }}>Ngày tham gia</th>
                    <th style={{ padding: "12px 18px", fontWeight: "600", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--eh-border)" }}>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ fontWeight: "700", color: "var(--eh-text)" }}>{u.fullName}</div>
                        <div style={{ fontSize: "12px", color: "var(--eh-muted)", marginTop: "2px" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "16px 18px", color: "var(--eh-text)" }}>
                        {u.phone || "—"}
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          className={`badge ${
                            u.role === "ADMIN" ? "badge-neutral" : u.role === "ORGANIZER" ? "badge-primary" : "badge-neutral"
                          }`}
                          style={{
                            background: u.role === "ADMIN" ? "#fee2e2" : u.role === "ORGANIZER" ? "#dbeafe" : "#f1f5f9",
                            color: u.role === "ADMIN" ? "#b91c1c" : u.role === "ORGANIZER" ? "#1d4ed8" : "#475569",
                            fontWeight: "700",
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            background: u.status === "ACTIVE" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: u.status === "ACTIVE" ? "var(--eh-green)" : "var(--eh-red)",
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px", color: "var(--eh-muted)", fontSize: "13px" }}>
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td style={{ padding: "16px 18px", textAlign: "center" }}>
                        {u.role !== "ADMIN" && (
                          u.status === "ACTIVE" ? (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenStatusModal(u, "BANNED")}
                              style={{ padding: "6px 14px", fontSize: "12px", color: "var(--eh-red)" }}
                              type="button"
                            >
                              Khóa tài khoản
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenStatusModal(u, "ACTIVE")}
                              style={{ padding: "6px 14px", fontSize: "12px", color: "var(--eh-green)" }}
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
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "18px", borderTop: "1px solid var(--eh-border)" }}>
              <button
                className="btn btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{ padding: "6px 14px", fontSize: "13px" }}
                type="button"
              >
                Trang trước
              </button>
              <span style={{ padding: "8px 14px", fontSize: "13px", color: "var(--eh-muted)" }}>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                style={{ padding: "6px 14px", fontSize: "13px" }}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              maxWidth: "460px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
              {newStatus === "BANNED" ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
            </h3>
            <p style={{ color: "var(--eh-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
              Bạn có chắc chắn muốn chuyển trạng thái tài khoản <strong>{targetUser.email}</strong> ({targetUser.fullName}) sang <strong>{newStatus}</strong>?
              {newStatus === "BANNED" && " Người dùng này sẽ không thể đăng nhập hoặc thực hiện bất kỳ giao dịch nào trên hệ thống."}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                disabled={updating}
                onClick={() => setTargetUser(null)}
                type="button"
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-primary"
                disabled={updating}
                onClick={handleConfirmStatusChange}
                style={{
                  background: newStatus === "BANNED" ? "var(--eh-red)" : "var(--eh-green)",
                  borderColor: newStatus === "BANNED" ? "var(--eh-red)" : "var(--eh-green)",
                }}
                type="button"
              >
                {updating ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
