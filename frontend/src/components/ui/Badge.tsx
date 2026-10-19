import type { PropsWithChildren } from "react";

type BadgeProps = {
  tone?: "accent" | "success" | "warning" | "muted";
  className?: string;
};

export function Badge({ children, className = "", tone = "accent" }: PropsWithChildren<BadgeProps>) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}
