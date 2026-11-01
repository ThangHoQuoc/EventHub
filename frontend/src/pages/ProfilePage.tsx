import { useState } from "react";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";
import { LineIcon } from "../components/ui/LineIcon";

type TabKey = "info" | "security" | "preferences";

export function ProfilePage() {
  const { user, logout, refreshProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // Form states cho thông tin cá nhân
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState("TP.HCM");
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Form states cho đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");

  // Form states cho thông báo
  const [emailNotify, setEmailNotify] = useState(true);
  const [waitlistNotify, setWaitlistNotify] = useState(true);
  const [newsletterNotify, setNewsletterNotify] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  const displayName = user?.fullName || user?.email || "Người dùng EventHub";
  const avatarInitials = displayName.split(" ").map((n) => n[0]).join("").slice(-2);

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoSuccess(false);
    setTimeout(() => setInfoSuccess(false), 3000);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecurityError("");
    setSecurityMessage("");

    if (newPassword.length < 6) {
      setSecurityError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setSecurityError("Đổi mật khẩu chưa khả dụng. Chưa có thay đổi nào được lưu.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSecurityMessage(""), 4000);
  }

  function handleSavePreferences() {
    setPrefSaved(false);
    setTimeout(() => setPrefSaved(false), 3000);
  }

  if (!user) {
    return (
      <CustomerLayout
        activeNav="profile"
        description="Đang tải dữ liệu tài khoản..."
        title="Hồ sơ tài khoản"
      >
        <p>Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      activeNav="profile"
      description="Quản lý thông tin cá nhân, cài đặt bảo mật và tùy chọn tài khoản trên EventHub."
      title="Hồ sơ tài khoản"
    >
      <div className="eh-profile-layout">
        {/* Cột trái: Card tóm tắt tài khoản */}
        <aside className="eh-profile-sidebar">
          <div className="eh-profile-header-meta">
            <div className="eh-profile-avatar" aria-hidden="true">
              {avatarInitials}
            </div>
            <h2 className="eh-profile-name">{user.fullName || "Chưa đặt tên"}</h2>
            <p className="eh-profile-email">{user.email}</p>
            <div className="eh-profile-badges">
              <span className="eh-badge-role">
                {user.role === "CUSTOMER"
                  ? "Khách hàng"
                  : user.role === "ORGANIZER"
                  ? "Ban tổ chức"
                  : "Quản trị viên"}
              </span>
              <span className="eh-badge-status">
                {user.status === "ACTIVE" ? "Đang hoạt động" : user.status}
              </span>
            </div>
          </div>

          <div className="eh-profile-info-list">
            <div className="eh-profile-info-row">
              <span>Mã tài khoản:</span>
              <strong style={{ fontFamily: "monospace", fontSize: "12px" }}>
                {user.id.slice(0, 8)}...
              </strong>
            </div>
            {user.createdAt && (
              <div className="eh-profile-info-row">
                <span>Ngày tham gia:</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
            )}
            <div className="eh-profile-info-row">
              <span>Bảo mật phiên:</span>
              <strong style={{ color: "#059669" }}>JWT Token an toàn</strong>
            </div>
          </div>

          <div className="eh-profile-sidebar-actions">
            <button
              className="btn btn-secondary"
              disabled={isLoading}
              onClick={() => void refreshProfile()}
              style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
              type="button"
            >
              <LineIcon name="trending" /> {isLoading ? "Đang tải lại..." : "Đồng bộ thông tin"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={logout}
              style={{ width: "100%", justifyContent: "center", color: "#dc2626", fontSize: "13px", borderColor: "#fecaca" }}
              type="button"
            >
              <LineIcon name="user" /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Cột phải: Tabs nội dung */}
        <main className="eh-profile-main">
          <div className="eh-profile-banner-notice">
            <LineIcon name="info" />
            <p className="notice" role="status" style={{ margin: 0 }}>
              Hồ sơ hiện chỉ đọc. Các form sửa hồ sơ, mật khẩu và thông báo là bản xem trước, chưa khả dụng.
            </p>
          </div>

          {/* Header tabs */}
          <div className="eh-profile-tabs-bar">
            <button
              className={`eh-profile-tab-btn ${activeTab === "info" ? "is-active" : ""}`}
              onClick={() => setActiveTab("info")}
              type="button"
            >
              <LineIcon name="user" />
              Thông tin cá nhân
            </button>
            <button
              className={`eh-profile-tab-btn ${activeTab === "security" ? "is-active" : ""}`}
              onClick={() => setActiveTab("security")}
              type="button"
            >
              <LineIcon name="lock" />
              Bảo mật & Mật khẩu
            </button>
            <button
              className={`eh-profile-tab-btn ${activeTab === "preferences" ? "is-active" : ""}`}
              onClick={() => setActiveTab("preferences")}
              type="button"
            >
              <LineIcon name="mail" />
              Tùy chọn thông báo
            </button>
          </div>

          {/* Tab 1: Thông tin cá nhân */}
          {activeTab === "info" && (
            <section className="eh-profile-card">
              <div className="eh-profile-card-head">
                <h3>Cập nhật thông tin cá nhân</h3>
                <p>Thông tin này được dùng để xuất vé điện tử VIP Pass và gửi thông báo đơn hàng.</p>
              </div>

              {infoSuccess && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    color: "#059669",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "18px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Đã cập nhật thông tin thành công!
                </div>
              )}

              <form className="ev-profile-form" onSubmit={handleSaveInfo}>
                <fieldset disabled style={{ border: 0, padding: 0 }}>
                  <div className="ev-form-group">
                    <label htmlFor="pf-email">Địa chỉ Email (Đăng nhập)</label>
                    <input disabled id="pf-email" type="email" value={user.email} />
                    <small style={{ color: "var(--eh-text-muted)" }}>
                      Email tài khoản không thể tự thay đổi để đảm bảo tính an toàn của vé đã phát hành.
                    </small>
                  </div>

                  <div className="ev-form-group">
                    <label htmlFor="pf-fullname">Họ và tên người nhận vé</label>
                    <input
                      id="pf-fullname"
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                      type="text"
                      value={fullName}
                    />
                  </div>

                  <div className="ev-form-grid-2">
                    <div className="ev-form-group">
                      <label htmlFor="pf-phone">Số điện thoại nhận SMS vé</label>
                      <input
                        id="pf-phone"
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0901 234 567"
                        type="tel"
                        value={phone}
                      />
                    </div>
                    <div className="ev-form-group">
                      <label htmlFor="pf-city">Thành phố sinh sống</label>
                      <select
                        id="pf-city"
                        onChange={(e) => setCity(e.target.value)}
                        value={city}
                      >
                        <option value="TP.HCM">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ paddingTop: "12px" }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        padding: "10px 24px",
                        fontSize: "14px",
                      }}
                      type="submit"
                    >
                      Lưu thông tin cá nhân
                    </button>
                  </div>
                </fieldset>
              </form>
            </section>
          )}

          {/* Tab 2: Bảo mật & Mật khẩu */}
          {activeTab === "security" && (
            <section className="eh-profile-card">
              <div className="eh-profile-card-head">
                <h3>Đổi mật khẩu tài khoản</h3>
                <p>Khuyến nghị sử dụng mật khẩu mạnh gồm chữ hoa, số và ký tự đặc biệt.</p>
              </div>

              {securityError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    color: "#dc2626",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "18px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {securityError}
                </div>
              )}

              {securityMessage && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    color: "#059669",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "18px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {securityMessage}
                </div>
              )}

              <form className="ev-profile-form" onSubmit={handleChangePassword}>
                <fieldset disabled style={{ border: 0, padding: 0 }}>
                  <div className="ev-form-group">
                    <label htmlFor="sec-current">Mật khẩu hiện tại</label>
                    <input
                      id="sec-current"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      required
                      type="password"
                      value={currentPassword}
                    />
                  </div>

                  <div className="ev-form-grid-2">
                    <div className="ev-form-group">
                      <label htmlFor="sec-new">Mật khẩu mới</label>
                      <input
                        id="sec-new"
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        type="password"
                        value={newPassword}
                      />
                    </div>
                    <div className="ev-form-group">
                      <label htmlFor="sec-confirm">Xác nhận mật khẩu mới</label>
                      <input
                        id="sec-confirm"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        type="password"
                        value={confirmPassword}
                      />
                    </div>
                  </div>

                  <div style={{ paddingTop: "12px" }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        padding: "10px 24px",
                        fontSize: "14px",
                      }}
                      type="submit"
                    >
                      Cập nhật mật khẩu mới
                    </button>
                  </div>
                </fieldset>
              </form>
            </section>
          )}

          {/* Tab 3: Tùy chọn thông báo */}
          {activeTab === "preferences" && (
            <section className="eh-profile-card">
              <div className="eh-profile-card-head">
                <h3>Cài đặt thông báo & Email</h3>
                <p>Tùy chỉnh các thông tin bạn muốn nhận từ EventHub.</p>
              </div>

              {prefSaved && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    color: "#059669",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "18px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Đã lưu cài đặt thông báo!
                </div>
              )}

              <div style={{ display: "grid", gap: "20px" }}>
                <label style={{ display: "flex", gap: "14px", alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    checked={emailNotify}
                    onChange={(e) => setEmailNotify(e.target.checked)}
                    style={{ marginTop: "4px" }}
                    type="checkbox"
                  />
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text-primary)" }}>
                      Nhận vé điện tử qua Email
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-text-muted)" }}>
                      Tự động gửi file vé điện tử và mã QR vào hòm thư ngay sau khi hoàn tất thanh toán.
                    </span>
                  </div>
                </label>

                <label style={{ display: "flex", gap: "14px", alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    checked={waitlistNotify}
                    onChange={(e) => setWaitlistNotify(e.target.checked)}
                    style={{ marginTop: "4px" }}
                    type="checkbox"
                  />
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text-primary)" }}>
                      Thông báo suất nhượng vé (Smart Waitlist)
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-text-muted)" }}>
                      Nhận thông báo khẩn cấp khi đến lượt bạn nhận vé từ hàng chờ để kịp xác nhận mua.
                    </span>
                  </div>
                </label>

                <label style={{ display: "flex", gap: "14px", alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    checked={newsletterNotify}
                    onChange={(e) => setNewsletterNotify(e.target.checked)}
                    style={{ marginTop: "4px" }}
                    type="checkbox"
                  />
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text-primary)" }}>
                      Bản tin sự kiện hot cuối tuần
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-text-muted)" }}>
                      Gợi ý các buổi concert, workshop và hội thảo công nghệ theo gu của bạn vào thứ 6 hàng tuần.
                    </span>
                  </div>
                </label>

                <div style={{ paddingTop: "10px" }}>
                  <button
                    className="btn btn-primary"
                    disabled
                    onClick={handleSavePreferences}
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      padding: "10px 24px",
                      fontSize: "14px",
                    }}
                    type="button"
                  >
                    Lưu tùy chọn thông báo
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </CustomerLayout>
  );
}
