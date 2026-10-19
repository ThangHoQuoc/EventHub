import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      description="Tiếp tục khám phá và quản lý vé của bạn."
      mode="login"
      title="Đăng nhập"
    >
      <LoginForm />
    </AuthLayout>
  );
}
