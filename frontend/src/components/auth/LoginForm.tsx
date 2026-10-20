import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "./AuthActions";
import { PasswordField, TextField } from "./AuthFields";
import { useAuth } from "../../context/AuthContext";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      navigate(redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\") ? redirect : "/", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.";
      setError(message);
    } finally {
      setLoading(false);
    }
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

      <p className="checkout-helper">Đăng nhập bằng email. Google và khôi phục mật khẩu chưa khả dụng.</p>

      {error ? <p className="eh-auth-error" role="alert">{error}</p> : null}

      <PrimaryButton disabled={loading} loading={loading} type="submit">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </PrimaryButton>

      <p className="eh-auth-switch">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </form>
  );
}
