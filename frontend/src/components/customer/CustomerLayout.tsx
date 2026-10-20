import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";
import { useAuth } from "../../context/AuthContext";

type CustomerLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  activeNav?: "tickets" | "bookings" | "waitlist" | "profile";
}>;

export function CustomerLayout({
  children,
  description,
  title,
  activeNav = "tickets",
}: CustomerLayoutProps) {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email || "Tài khoản";
  const displayEmail = user?.email || "";
  const displayRole = user?.role === "ORGANIZER" ? "Ban tổ chức" : user?.role === "ADMIN" ? "Quản trị viên" : "Tài khoản cá nhân";
  const avatarInitials = displayName.split(" ").map((n) => n[0]).join("").slice(-2);

  return (
    <div className="ev-editorial-page ev-customer-page">
      <div className="ev-customer-shell">
        {/* Header strip */}
        <header className="ev-customer-header">
          <div className="ev-customer-user-badge">
            <div className="ev-customer-avatar" aria-hidden="true">
              {avatarInitials}
            </div>
            <div>
              <span className="ev-customer-role">{displayRole}</span>
              <h1>{displayName}</h1>
              <p>{displayEmail}</p>
            </div>
          </div>
        </header>

        {/* Customer sub-nav tabs */}
        <nav className="ev-customer-nav" aria-label="Điều hướng tài khoản">
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "tickets" ? "is-active" : "")}
            to="/my-tickets"
          >
            <LineIcon name="ticket" />
            <span>Vé của tôi</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "bookings" ? "is-active" : "")}
            to="/my-bookings"
          >
            <LineIcon name="calendar" />
            <span>Đơn hàng</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "waitlist" ? "is-active" : "")}
            to="/my-waitlist"
          >
            <LineIcon name="clock" />
            <span>Danh sách chờ</span>

          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "profile" ? "is-active" : "")}
            to="/profile"
          >
            <LineIcon name="user" />
            <span>Hồ sơ cá nhân</span>
          </NavLink>
        </nav>

        {/* Page Content Heading */}
        <div className="ev-customer-content-head">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="ev-customer-content-body">{children}</div>
      </div>
    </div>
  );
}
