import { useState } from "react";
import type { Event, TicketAvailability } from "../../types/event";
import { LineIcon } from "../ui/LineIcon";

export function DateBadge({ date }: { date: string }) {
  const value = new Date(date);
  return (
    <span className="ev-date-badge">
      <strong>{String(value.getDate()).padStart(2, "0")}</strong>
      <small>TH{value.getMonth() + 1}</small>
    </span>
  );
}

const statusCopy: Record<TicketAvailability, string> = {
  UNKNOWN: "Xem chi tiết vé",
  AVAILABLE: "Còn vé",
  LOW_STOCK: "Sắp hết vé",
  SOLD_OUT: "Hết vé",
  WAITLIST_AVAILABLE: "Hết vé · Có waitlist",
};

export function StatusBadge({ status }: { status: TicketAvailability }) {
  return <span className={`ev-status ev-status--${status.toLowerCase()}`}><i />{statusCopy[status]}</span>;
}

export function SaveButton({ event }: { event: Event }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      aria-label={`${saved ? "Bỏ lưu" : "Lưu"} sự kiện ${event.title}`}
      aria-pressed={saved}
      className={`ev-save-button ${saved ? "is-saved" : ""}`}
      onClick={() => setSaved((current) => !current)}
      type="button"
    >
      <LineIcon name="bookmark" />
    </button>
  );
}
