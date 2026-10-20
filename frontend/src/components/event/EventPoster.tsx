import type { Event } from "../../types/event";

const themes: Record<string, string> = {
  "Công nghệ": "forest",
  Networking: "paper",
  "Âm nhạc": "amber",
  Workshop: "sage",
  "Kinh doanh": "ink",
  "Nghệ thuật": "clay",
};

type EventPosterProps = {
  event: Event;
  variant?: "standard" | "wide" | "hero";
};

export function EventPoster({ event, variant = "standard" }: EventPosterProps) {
  const words = event.title.split(" ");
  const posterTitle = words.slice(0, 4).join(" ");
  const date = new Date(event.startAt);

  return (
    <div className={`ev-poster ev-poster--${themes[event.category] ?? "forest"} ev-poster--${variant}`} aria-hidden="true">
      <span className="ev-poster-city">{event.city}</span>
      <span className="ev-poster-date">{String(date.getDate()).padStart(2, "0")} / {String(date.getMonth() + 1).padStart(2, "0")}</span>
      <strong>{posterTitle}</strong>
      <span className="ev-poster-year">EVENTHUB · 2026</span>
      <i className="ev-poster-orbit ev-poster-orbit--one" />
      <i className="ev-poster-orbit ev-poster-orbit--two" />
      <i className="ev-poster-grid" />
    </div>
  );
}
