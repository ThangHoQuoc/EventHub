import { AuthLayout } from "../components/auth/AuthLayout";
import { RegisterForm } from "../components/auth/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout
      description="Bắt đầu tìm sự kiện phù hợp với bạn."
      mode="register"
      title="Tạo tài khoản"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
