import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCheckbox, PrimaryButton, RoleSwitch } from "./AuthActions";
import { PasswordField, TextField } from "./AuthFields";
import { useAuth } from "../../context/AuthContext";

export function RegisterForm() {
  const [role, setRole] = useState<"CUSTOMER" | "ORGANIZER">("CUSTOMER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (!fullName || fullName.length < 2) {
      setError("Họ và tên cần từ 2 ký tự trở lên.");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu cần tối thiểu 8 ký tự theo quy định bảo mật.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    if (!form.get("terms")) {
      setError("Bạn cần đồng ý với điều khoản sử dụng.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
      });
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      window.setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng ký thất bại. Email có thể đã được sử dụng.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="eh-auth-form eh-auth-form--register" noValidate onSubmit={handleSubmit}>
      <RoleSwitch onChange={setRole} value={role} />

      <div className="eh-auth-field-grid">
        <TextField
          autoComplete="name"
          icon="user"
          label="Họ và tên"
          name="fullName"
          placeholder="Nguyễn Minh Anh"
        />
        <TextField
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="minhanh@email.com"
          type="email"
        />
        <PasswordField
          autoComplete="new-password"
          label="Mật khẩu"
          name="password"
          placeholder="Tối thiểu 8 ký tự"
        />
        <PasswordField
          autoComplete="new-password"
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      <AuthCheckbox name="terms">
        Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a> và <a href="#privacy">Chính sách bảo mật</a>
      </AuthCheckbox>

      {error ? <p className="eh-auth-error" role="alert">{error}</p> : null}
      {success ? (
        <p
          className="eh-auth-success"
          role="status"
          style={{
            background: "var(--eh-green-50)",
            border: "1px solid var(--eh-green-100)",
            borderRadius: "var(--radius-md)",
            color: "var(--eh-green)",
            fontSize: 12,
            fontWeight: 700,
            padding: "10px 14px",
            margin: "0 0 16px",
          }}
        >
          {success}
        </p>
      ) : null}

      <PrimaryButton disabled={loading} loading={loading} type="submit">
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </PrimaryButton>

      <p className="eh-auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </form>
  );
}
