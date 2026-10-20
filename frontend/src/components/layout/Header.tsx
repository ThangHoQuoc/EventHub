import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { EventHubBrand } from "../ui/EventHubBrand";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  editorial?: boolean;
};

export function Header({ editorial = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!editorial) return;
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [editorial]);

  return (
    <header
      className={[
        "site-header",
        editorial ? "site-header-editorial" : "site-header-compact",
        scrolled ? "is-scrolled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <EventHubBrand />
      <nav className="nav-links" aria-label="Điều hướng chính">
        <NavLink to="/explore">Khám phá</NavLink>
        <NavLink to="/eventmatch">EventMatch</NavLink>
        {(!user || user.role === "CUSTOMER") && <NavLink to="/my-tickets">Vé của tôi</NavLink>}
        {user && ["ADMIN", "ORGANIZER"].includes(user.role) && <NavLink to="/organizer">Nhà tổ chức</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin/payments">Xác nhận thanh toán</NavLink>}
      </nav>
      <div className="header-actions">
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NavLink
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "var(--eh-text)",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--eh-green-50)",
                  border: "1.5px solid var(--eh-green-100)",
                  color: "var(--eh-green)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </span>
              <span>{user.fullName || user.email}</span>
            </NavLink>
            <button
              onClick={logout}
              className="ghost-link"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
              }}
              type="button"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <>
            <NavLink className="ghost-link" to="/login">
              Đăng nhập
            </NavLink>
            <NavLink className="btn btn-primary" to="/register">
              Đăng ký
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
