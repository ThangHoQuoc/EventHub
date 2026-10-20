import { useState } from "react";
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
  const [imgError, setImgError] = useState(false);
  const words = event.title.split(" ");
  const posterTitle = words.slice(0, 4).join(" ");
  const date = new Date(event.startAt);

  const hasValidImage = Boolean(
    event.imageUrl &&
      !imgError &&
      !event.imageUrl.includes("example.com") &&
      event.imageUrl.startsWith("http")
  );

  return (
    <div
      className={`ev-poster ev-poster--${themes[event.category] ?? "forest"} ev-poster--${variant} ${
        hasValidImage ? "ev-poster--has-image" : ""
      }`}
      aria-hidden="true"
    >
      {hasValidImage ? (
        <>
          <img
            alt={event.title}
            className="ev-poster-image"
            loading="lazy"
            onError={() => setImgError(true)}
            src={event.imageUrl}
          />
          <div className="ev-poster-overlay" />
        </>
      ) : (
        <>
          <i className="ev-poster-orbit ev-poster-orbit--one" />
          <i className="ev-poster-orbit ev-poster-orbit--two" />
          <i className="ev-poster-grid" />
        </>
      )}

      <span className="ev-poster-city">{event.city}</span>
      <span className="ev-poster-date">
        {String(date.getDate()).padStart(2, "0")} / {String(date.getMonth() + 1).padStart(2, "0")}
      </span>
      <strong>{posterTitle}</strong>
      <span className="ev-poster-year">EVENTHUB · 2026</span>
    </div>
  );
}

