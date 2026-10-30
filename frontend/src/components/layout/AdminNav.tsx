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
    <nav style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--eh-border)", paddingBottom: "14px", marginBottom: "28px" }}>
      {links.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-lg)",
              fontSize: "14px",
              fontWeight: isActive ? "700" : "500",
              color: isActive ? "var(--eh-primary)" : "var(--eh-muted)",
              background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
              border: isActive ? "1px solid rgba(37,99,235,0.2)" : "1px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <LineIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
