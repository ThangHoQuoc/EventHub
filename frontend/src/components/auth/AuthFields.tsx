import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { AuthIcon } from "./AuthIcon";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  icon?: "mail" | "phone" | "user";
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ error, icon = "mail", id, label, ...props }, ref) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`eh-auth-field ${error ? "has-error" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="eh-auth-input-wrap">
        <AuthIcon name={icon} />
        <input
          {...props}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          id={inputId}
          ref={ref}
        />
      </div>
      {error ? <small id={errorId}>{error}</small> : null}
    </div>
  );
});

type PasswordFieldProps = Omit<TextFieldProps, "icon" | "type">;

export function PasswordField({ error, id, label, ...props }: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div className={`eh-auth-field ${error ? "has-error" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="eh-auth-input-wrap">
        <AuthIcon name="lock" />
        <input
          {...props}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          id={inputId}
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="eh-password-toggle"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          <AuthIcon name={visible ? "eye-off" : "eye"} />
        </button>
      </div>
      {error ? <small id={errorId}>{error}</small> : null}
    </div>
  );
}
