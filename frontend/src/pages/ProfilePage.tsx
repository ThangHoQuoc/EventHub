import { useEffect, useState } from "react";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockUserProfile } from "../data/mockCustomer";
import { useAuth } from "../context/AuthContext";
import type { UserProfile } from "../types/customer";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...mockUserProfile,
    fullName: user?.fullName || mockUserProfile.fullName,
    email: user?.email || mockUserProfile.email,
    phone: user?.phone || mockUserProfile.phone,
  }));
  const [isSaved, setIsSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwdMsg("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    setPwdMsg("Đã cập nhật mật khẩu mới thành công!");
    setOldPassword("");
    setNewPassword("");
    setTimeout(() => setPwdMsg(null), 3000);
  }

  return (
    <CustomerLayout
      activeNav="profile"
      description="Quản lý thông tin cá nhân và bảo mật tài khoản EventHub."
      title="Hồ sơ tài khoản"
    >
      <div className="ev-profile-layout">
        {/* Form thông tin cá nhân */}
        <section className="ev-profile-card">
          <div className="ev-profile-card-head">
            <h3>Thông tin liên hệ nhận vé</h3>
            <p>Thông tin này sẽ được tự động điền khi bạn tiến hành đặt vé sự kiện.</p>
          </div>

          {isSaved && (
            <div className="ev-customer-banner is-success">
              <LineIcon name="check" />
              <span>Đã lưu thông tin cá nhân thành công!</span>
            </div>
          )}

          <form className="ev-profile-form" onSubmit={handleSaveInfo}>
            <div className="ev-form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                required
                type="text"
                value={profile.fullName}
              />
            </div>

            <div className="ev-form-grid-2">
              <div className="ev-form-group">
                <label htmlFor="email">Email</label>
                <input
                  disabled
                  id="email"
                  title="Email không thể thay đổi sau khi đăng ký"
                  type="email"
                  value={profile.email}
                />
                <small>Email tài khoản không thể chỉnh sửa</small>
              </div>

              <div className="ev-form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                  type="tel"
                  value={profile.phone}
                />
              </div>
            </div>

            <div className="ev-form-group">
              <label htmlFor="city">Thành phố sinh sống</label>
              <select
                id="city"
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                value={profile.city}
              >
                <option value="TP.HCM">TP.HCM</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Đà Lạt">Đà Lạt</option>
              </select>
            </div>

            <button className="ev-btn-primary" type="submit">
              Lưu thay đổi
            </button>
          </form>
        </section>

        {/* Đổi mật khẩu */}
        <section className="ev-profile-card">
          <div className="ev-profile-card-head">
            <h3>Bảo mật & Mật khẩu</h3>
            <p>Nên sử dụng mật khẩu mạnh kết hợp chữ và số để bảo vệ vé của bạn.</p>
          </div>

          {pwdMsg && (
            <div
              className={`ev-customer-banner ${
                pwdMsg.includes("thành công") ? "is-success" : "is-error"
              }`}
            >
              <LineIcon name={pwdMsg.includes("thành công") ? "check" : "alert"} />
              <span>{pwdMsg}</span>
            </div>
          )}

          <form className="ev-profile-form" onSubmit={handleChangePassword}>
            <div className="ev-form-group">
              <label htmlFor="oldPassword">Mật khẩu hiện tại</label>
              <input
                id="oldPassword"
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
                type="password"
                value={oldPassword}
              />
            </div>

            <div className="ev-form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                id="newPassword"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                type="password"
                value={newPassword}
              />
            </div>

            <button className="ev-btn-outline" type="submit">
              Đổi mật khẩu
            </button>
          </form>
        </section>

        {/* Quản lý phiên đăng nhập */}
        {user && (
          <section className="ev-profile-card">
            <div className="ev-profile-card-head">
              <h3>Phiên đăng nhập hiện tại</h3>
              <p>Đăng xuất khỏi thiết bị này nếu bạn đang sử dụng máy tính công cộng.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ display: "block", color: "var(--eh-text)", fontSize: 14 }}>
                  {user.email}
                </strong>
                <small style={{ color: "var(--eh-muted)", fontSize: 12 }}>
                  Vai trò: {user.role} · Trạng thái: {user.status}
                </small>
              </div>
              <button
                className="ev-btn-outline"
                onClick={logout}
                style={{ borderColor: "var(--eh-error)", color: "var(--eh-error)" }}
                type="button"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
}
