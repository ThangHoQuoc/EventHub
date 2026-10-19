import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { AuthIcon } from "./AuthIcon";

export function GoogleButton() {
  return (
    <button className="eh-google-button" type="button">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" fill="#4285F4" />
        <path d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.25-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.03v2.61A10 10 0 0 0 12 22Z" fill="#34A853" />
        <path d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.03A10 10 0 0 0 2 12c0 1.61.38 3.14 1.03 4.53l3.36-2.61Z" fill="#FBBC05" />
        <path d="M12 5.95c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.97 5.47l3.36 2.61C7.18 7.71 9.39 5.95 12 5.95Z" fill="#EA4335" />
      </svg>
      Tiếp tục với Google
    </button>
  );
}

type AuthCheckboxProps = {
  name?: string;
  children: React.ReactNode;
};

export function AuthCheckbox({ children, name }: AuthCheckboxProps) {
  return (
    <label className="eh-auth-checkbox">
      <input name={name} type="checkbox" />
      <span aria-hidden="true">✓</span>
      <em>{children}</em>
    </label>
  );
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function PrimaryButton({ children, className = "", loading = false, ...props }: PropsWithChildren<PrimaryButtonProps>) {
  return (
    <button className={`eh-auth-submit ${className}`.trim()} {...props} aria-busy={loading}>
      {loading ? <span className="eh-auth-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

type RoleSwitchProps = {
  value: "CUSTOMER" | "ORGANIZER";
  onChange: (value: "CUSTOMER" | "ORGANIZER") => void;
};

export function RoleSwitch({ onChange, value }: RoleSwitchProps) {
  return (
    <div className="eh-role-switch" role="group" aria-label="Chọn loại tài khoản">
      <span className={`eh-role-thumb ${value === "ORGANIZER" ? "is-right" : ""}`} aria-hidden="true" />
      <button aria-pressed={value === "CUSTOMER"} onClick={() => onChange("CUSTOMER")} type="button">
        <AuthIcon name="user" /><span>Người tham dự</span>
      </button>
      <button aria-pressed={value === "ORGANIZER"} onClick={() => onChange("ORGANIZER")} type="button">
        <AuthIcon name="ticket" /><span>Nhà tổ chức</span>
      </button>
    </div>
  );
}
