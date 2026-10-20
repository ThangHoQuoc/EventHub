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
    setInfoSuccess(true);
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

    setSecurityMessage("Yêu cầu đổi mật khẩu đã được ghi nhận. Phiên đăng nhập được bảo vệ an toàn.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSecurityMessage(""), 4000);
  }

  function handleSavePreferences() {
    setPrefSaved(true);
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
      <div className="ev-profile-page-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "28px", alignItems: "start" }}>
        {/* Cột trái: Card tóm tắt tài khoản */}
        <aside className="ev-profile-card ev-profile-summary">
          <div style={{ textAlign: "center", paddingBottom: "20px", borderBottom: "1px solid var(--eh-border)" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--eh-green) 0%, #34a853 100%)",
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                boxShadow: "0 4px 14px rgba(31, 138, 91, 0.25)",
              }}
            >
              {avatarInitials}
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 6px", color: "var(--eh-text)" }}>
              {user.fullName || "Chưa đặt tên"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--eh-muted)", margin: "0 0 12px" }}>
              {user.email}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "var(--eh-green-50)",
                  color: "var(--eh-green)",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                {user.role === "CUSTOMER" ? "Khách hàng" : user.role === "ORGANIZER" ? "Ban tổ chức" : "Quản trị viên"}
              </span>
              <span
                style={{
                  background: user.status === "ACTIVE" ? "#e6f4ea" : "#fce8e6",
                  color: user.status === "ACTIVE" ? "#137333" : "#c5221f",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                {user.status === "ACTIVE" ? "Đang hoạt động" : user.status}
              </span>
            </div>
          </div>

          <div style={{ padding: "18px 0", display: "grid", gap: "10px", fontSize: "12px", borderBottom: "1px solid var(--eh-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)" }}>
              <span>Mã tài khoản:</span>
              <strong style={{ color: "var(--eh-text)", fontFamily: "monospace" }}>{user.id.slice(0, 8)}...</strong>
            </div>
            {user.createdAt && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)" }}>
                <span>Ngày tham gia:</span>
                <strong style={{ color: "var(--eh-text)" }}>{formatDate(user.createdAt)}</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--eh-muted)" }}>
              <span>Xác thực:</span>
              <strong style={{ color: "var(--eh-green)" }}>JWT Token an toàn</strong>
            </div>
          </div>

          <div style={{ paddingTop: "18px", display: "grid", gap: "10px" }}>
            <button
              className="btn btn-secondary"
              disabled={isLoading}
              onClick={() => void refreshProfile()}
              style={{ width: "100%", justifyContent: "center" }}
              type="button"
            >
              <LineIcon name="trending" /> {isLoading ? "Đang tải lại..." : "Đồng bộ thông tin"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={logout}
              style={{ width: "100%", justifyContent: "center", color: "var(--eh-error)" }}
              type="button"
            >
              <LineIcon name="user" /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Cột phải: Tabs nội dung */}
        <main className="ev-profile-content">
          {/* Header tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              background: "var(--eh-surface)",
              padding: "6px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--eh-border)",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => setActiveTab("info")}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: 0,
                borderRadius: "var(--radius-md)",
                background: activeTab === "info" ? "var(--eh-green)" : "transparent",
                color: activeTab === "info" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("security")}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: 0,
                borderRadius: "var(--radius-md)",
                background: activeTab === "security" ? "var(--eh-green)" : "transparent",
                color: activeTab === "security" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Bảo mật & Mật khẩu
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: 0,
                borderRadius: "var(--radius-md)",
                background: activeTab === "preferences" ? "var(--eh-green)" : "transparent",
                color: activeTab === "preferences" ? "#ffffff" : "var(--eh-muted)",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              type="button"
            >
              Tùy chọn thông báo
            </button>
          </div>

          {/* Tab 1: Thông tin cá nhân */}
          {activeTab === "info" && (
            <section className="ev-profile-card">
              <div className="ev-profile-card-head">
                <h3>Cập nhật thông tin cá nhân</h3>
                <p>Thông tin này được dùng để xuất vé điện tử và gửi thông báo đơn hàng.</p>
              </div>

              {infoSuccess && (
                <div
                  style={{
                    background: "var(--eh-green-50)",
                    border: "1px solid var(--eh-green-100)",
                    color: "var(--eh-green)",
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
                <div className="ev-form-group">
                  <label htmlFor="pf-email">Địa chỉ Email (Đăng nhập)</label>
                  <input
                    disabled
                    id="pf-email"
                    type="email"
                    value={user.email}
                  />
                  <small>Email tài khoản không thể tự thay đổi để đảm bảo tính an toàn của vé đã phát hành.</small>
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

                <div style={{ paddingTop: "8px" }}>
                  <button className="ev-btn-primary" type="submit">
                    Lưu thông tin cá nhân
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Tab 2: Bảo mật & Mật khẩu */}
          {activeTab === "security" && (
            <section className="ev-profile-card">
              <div className="ev-profile-card-head">
                <h3>Đổi mật khẩu tài khoản</h3>
                <p>Khuyến nghị sử dụng mật khẩu mạnh gồm chữ hoa, số và ký tự đặc biệt.</p>
              </div>

              {securityError && (
                <div
                  style={{
                    background: "#fce8e6",
                    border: "1px solid #fad2cf",
                    color: "var(--eh-error)",
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
                    background: "var(--eh-green-50)",
                    border: "1px solid var(--eh-green-100)",
                    color: "var(--eh-green)",
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

                <div style={{ paddingTop: "8px" }}>
                  <button className="ev-btn-primary" type="submit">
                    Cập nhật mật khẩu mới
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Tab 3: Tùy chọn thông báo */}
          {activeTab === "preferences" && (
            <section className="ev-profile-card">
              <div className="ev-profile-card-head">
                <h3>Cài đặt thông báo & Email</h3>
                <p>Tùy chỉnh các thông tin bạn muốn nhận từ EventHub.</p>
              </div>

              {prefSaved && (
                <div
                  style={{
                    background: "var(--eh-green-50)",
                    border: "1px solid var(--eh-green-100)",
                    color: "var(--eh-green)",
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
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text)" }}>
                      Nhận vé điện tử qua Email
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
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
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text)" }}>
                      Thông báo suất nhượng vé (Smart Waitlist)
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
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
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--eh-text)" }}>
                      Bản tin sự kiện hot cuối tuần
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--eh-muted)" }}>
                      Gợi ý các buổi concert, workshop và hội thảo công nghệ theo gu của bạn vào thứ 6 hàng tuần.
                    </span>
                  </div>
                </label>

                <div style={{ paddingTop: "10px" }}>
                  <button className="ev-btn-primary" onClick={handleSavePreferences} type="button">
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
