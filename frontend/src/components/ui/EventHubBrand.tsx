import type { MouseEventHandler } from "react";
import { Link } from "react-router-dom";

type EventHubBrandProps = {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function EventHubBrand({ className = "", onClick }: EventHubBrandProps) {
  return (
    <Link className={`eventhub-brand ${className}`.trim()} onClick={onClick} to="/" aria-label="EventHub - về trang chủ">
      <svg aria-hidden="true" viewBox="0 0 34 28">
        <path d="M3 3h28v7a4 4 0 0 0 0 8v7H3v-7a4 4 0 0 0 0-8V3Z" />
        <path d="M12 3v22" />
        <circle cx="21.5" cy="10" r="2" />
        <path d="m19.5 18 2 2 4-5" />
      </svg>
      <span>EventHub</span>
    </Link>
  );
}
