import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "./AuthActions";
import { PasswordField, TextField } from "./AuthFields";
import { useAuth } from "../../context/AuthContext";
import { LineIcon } from "../ui/LineIcon";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email.includes("@") || password.length < 6) {
      setError("Vui lòng nhập email hợp lệ và mật khẩu từ 6 ký tự.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      const redirect = params.get("redirect") ?? "/";
      navigate(
        redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")
          ? redirect
          : "/",
        { replace: true }
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(_role: "customer" | "admin") {
    setError("Đăng nhập demo chưa được cấu hình. Vui lòng dùng tài khoản của bạn.");
  }

  return (
    <form className="eh-auth-form" noValidate onSubmit={handleSubmit}>
      <TextField
        autoComplete="email"
        label="Email"
        name="email"
        placeholder="minhanh@email.com"
        type="email"
      />
      <PasswordField
        autoComplete="current-password"
        label="Mật khẩu"
        name="password"
        placeholder="Nhập mật khẩu"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--eh-muted)", margin: "4px 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input defaultChecked type="checkbox" />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <button
          onClick={() => setShowForgot(!showForgot)}
          style={{ background: "none", border: 0, color: "var(--eh-green)", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
          type="button"
        >
          Quên mật khẩu?
        </button>
      </div>

      {showForgot && (
        <div style={{ background: "var(--eh-bg)", border: "1px solid var(--eh-border)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "12px", color: "var(--eh-muted)" }}>
          <LineIcon name="info" /> Để đặt lại mật khẩu bảo mật, vui lòng gửi email về <strong>support@eventhub.vn</strong> kèm email đăng ký của bạn.
        </div>
      )}

      {error ? <p className="eh-auth-error" role="alert">{error}</p> : null}

      <PrimaryButton disabled={loading} loading={loading} type="submit">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </PrimaryButton>

      {/* Đăng nhập nhanh thử nghiệm */}
      <div style={{ margin: "16px 0 6px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: "50% 0", borderTop: "1px solid var(--eh-border)" }} />
        <span style={{ position: "relative", background: "var(--eh-surface)", padding: "0 12px", fontSize: "11px", color: "var(--eh-placeholder)", fontWeight: "600" }}>
          HOẶC ĐĂNG NHẬP NHANH
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <button
          className="btn btn-secondary"
          disabled={loading}
          onClick={() => handleDemoLogin("customer")}
          style={{ fontSize: "11px", padding: "0 10px", minHeight: "36px", justifyContent: "center" }}
          type="button"
        >
          <LineIcon name="user" /> Demo Khách hàng
        </button>
        <button
          className="btn btn-secondary"
          disabled={loading}
          onClick={() => handleDemoLogin("admin")}
          style={{ fontSize: "11px", padding: "0 10px", minHeight: "36px", justifyContent: "center" }}
          type="button"
        >
          <LineIcon name="shield" /> Demo Quản trị
        </button>
      </div>

      <p className="eh-auth-switch" style={{ marginTop: "18px" }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký thành viên mới</Link>
      </p>
    </form>
  );
}
