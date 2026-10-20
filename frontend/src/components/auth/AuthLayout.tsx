import type { PropsWithChildren } from "react";
import { AuthHeader } from "./AuthHeader";
import { LoginVisual } from "./LoginVisual";
import { RegisterVisual } from "./RegisterVisual";

type AuthLayoutProps = {
  title: string;
  description: string;
  mode: "login" | "register";
};

export function AuthLayout({ children, description, mode, title }: PropsWithChildren<AuthLayoutProps>) {
  return (
    <section className={`eh-auth-page eh-auth-page--${mode}`}>
      <AuthHeader mode={mode} />
      <div className="eh-auth-main">
        <aside
          className="eh-auth-visual"
          aria-label={mode === "login" ? "Khám phá EventMatch" : "Lợi ích khi tham gia EventHub"}
        >
          {mode === "login" ? <LoginVisual /> : <RegisterVisual />}
        </aside>

        <div className="eh-auth-form-column">
          <section className="eh-auth-card" aria-labelledby="eh-auth-card-title">
            <header className="eh-auth-card-header">
              <span className="eh-auth-card-kicker">Tài khoản EventHub</span>
              <h2 id="eh-auth-card-title">{title}</h2>
              <p>{description}</p>
            </header>
            {children}
          </section>
          <p className="eh-auth-security">
            <span aria-hidden="true" className="eh-auth-security-icon">✓</span>
            Thông tin của bạn được bảo mật
          </p>
        </div>
      </div>
    </section>
  );
}
