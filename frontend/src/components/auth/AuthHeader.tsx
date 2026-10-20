import { Link } from "react-router-dom";
import { EventHubBrand } from "../ui/EventHubBrand";

type AuthHeaderProps = {
  mode: "login" | "register";
};

export function AuthHeader({ mode }: AuthHeaderProps) {
  const isLogin = mode === "login";

  return (
    <header className="eh-auth-header">
      <EventHubBrand className="eh-auth-brand" />

      <nav className="eh-auth-nav" aria-label="Điều hướng tài khoản">
        <Link className="eh-auth-explore-link" to="/explore">Khám phá sự kiện</Link>
        <Link className="eh-auth-outline-link" to={isLogin ? "/register" : "/login"}>
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </nav>
    </header>
  );
}
