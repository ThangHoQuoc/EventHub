import { Link, useLocation } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

export function AdminNav() {
  const location = useLocation();

  const links = [
    { to: "/admin/stats", label: "Thống kê sàn & KPI", icon: "trending" as const },
    { to: "/admin/users", label: "Quản lý Người dùng", icon: "user" as const },
    { to: "/admin/payments", label: "Đối soát Thanh toán", icon: "card" as const },
  ];

  return (
    <nav aria-label="Thanh điều hướng Quản trị viên" className="eh-admin-nav-bar">
      {links.map((item) => {
        const isActive = location.pathname === item.to || (item.to === "/admin/stats" && location.pathname === "/admin");
        return (
          <Link
            key={item.to}
            className={`eh-admin-nav-link ${isActive ? "is-active" : ""}`}
            to={item.to}
          >
            <LineIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
