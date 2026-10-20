import type { PropsWithChildren } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LineIcon } from "../ui/LineIcon";

type OrganizerLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  activeNav?: "dashboard" | "create" | "checkin";
  actionButton?: React.ReactNode;
}>;

export function OrganizerLayout({
  children,
  description,
  title,
  activeNav = "dashboard",
  actionButton,
}: OrganizerLayoutProps) {
  const { user } = useAuth();
  return (
    <div className="ev-editorial-page ev-organizer-page">
      <div className="ev-organizer-shell">
        {/* Organizer Header Profile Strip */}
        <header className="ev-organizer-header">
          <div className="ev-organizer-brand-badge">
            <div className="ev-organizer-avatar" aria-hidden="true">
              <LineIcon name="building" />
            </div>
            <div>
              <span className="ev-organizer-kicker">Cổng Nhà Tổ Chức (Organizer Portal)</span>
              <h1>{user?.fullName || user?.email}</h1>
              <p>{user?.email} · {user?.role}</p>
            </div>
          </div>

          <div className="ev-organizer-header-actions">
            {actionButton || (
              <Link className="ev-btn-primary" to="/organizer/events/new">
                <LineIcon name="plus" />
                Tạo sự kiện mới
              </Link>
            )}
          </div>
        </header>

        {/* Organizer Navigation Tabs */}
        <nav className="ev-organizer-nav" aria-label="Điều hướng nhà tổ chức">
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "dashboard" ? "is-active" : "")}
            to="/organizer/dashboard"
          >
            <LineIcon name="trending" />
            <span>Tổng quan & Sự kiện</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "create" ? "is-active" : "")}
            to="/organizer/events/new"
          >
            <LineIcon name="plus" />
            <span>Tạo sự kiện</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive || activeNav === "checkin" ? "is-active" : "")}
            to="/organizer/check-in"
          >
            <LineIcon name="shield" />
            <span>Trạm soát vé Check-in</span>
            <em className="ev-nav-badge">Trực tiếp</em>
          </NavLink>
        </nav>

        {/* Content Heading */}
        <div className="ev-organizer-content-head">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="ev-organizer-content-body">{children}</div>
      </div>
    </div>
  );
}
