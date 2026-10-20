import { CustomerLayout } from "../components/customer/CustomerLayout";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

export function ProfilePage() {
  const {user,logout,refreshProfile,isLoading} = useAuth();
  return <CustomerLayout activeNav="profile" title="Hồ sơ tài khoản" description="Thông tin tài khoản hiện tại từ hệ thống.">
    {user && <section className="ev-profile-card"><h3>Thông tin cá nhân</h3><dl><dt>Họ tên</dt><dd>{user.fullName}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Điện thoại</dt><dd>{user.phone || "Chưa cung cấp"}</dd><dt>Vai trò</dt><dd>{user.role}</dd><dt>Trạng thái</dt><dd>{user.status}</dd>{user.createdAt && <><dt>Ngày tạo</dt><dd>{formatDate(user.createdAt)}</dd></>}</dl><p>Chỉnh sửa hồ sơ và đổi mật khẩu hiện chưa khả dụng.</p><button className="btn btn-secondary" disabled={isLoading} onClick={() => {void refreshProfile();}}>Tải lại thông tin</button> <button className="btn btn-secondary" onClick={logout}>Đăng xuất</button></section>}
  </CustomerLayout>;
}
