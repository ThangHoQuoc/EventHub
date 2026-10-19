import type { PropsWithChildren } from "react";
import { QRCode } from "../ui/QRCode";

export function SparkleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M10 2.3c.6 4.2 3.1 6.7 7.2 7.2-4.1.6-6.6 3-7.2 7.2-.6-4.2-3.1-6.6-7.2-7.2 4.1-.5 6.6-3 7.2-7.2Z" />
      <path d="M15.6 2.5c.2 1.2.9 1.9 2.1 2.1-1.2.2-1.9.9-2.1 2.1-.2-1.2-.9-1.9-2.1-2.1 1.2-.2 1.9-.9 2.1-2.1Z" />
    </svg>
  );
}

export function TagPill({ children }: PropsWithChildren) {
  return <span className="eh-auth-tag">{children}</span>;
}

type MatchScoreRingProps = {
  score: number;
  compact?: boolean;
};

export function MatchScoreRing({ compact = false, score }: MatchScoreRingProps) {
  return (
    <div className={`eh-match-ring ${compact ? "is-compact" : ""}`} style={{ "--score": score } as React.CSSProperties}>
      <div>
        <strong>{score}%</strong>
        {!compact ? <span>Phù hợp<br />với bạn</span> : null}
      </div>
    </div>
  );
}

type StatItemProps = {
  value: string;
  label: string;
};

export function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="eh-auth-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function QrMark() {
  return <QRCode className="eh-auth-qr" label="Mã QR minh họa" />;
}

export function TicketCard() {
  return (
    <div className="eh-ticket-card" aria-hidden="true">
      <div className="eh-ticket-card-copy">
        <span>VÉ THAM DỰ</span>
        <strong>EH-1025-SGN</strong>
        <small>12.10.2025 · 18:30</small>
      </div>
      <div className="eh-ticket-card-stub">
        <QrMark />
      </div>
    </div>
  );
}

type EventMatchCardProps = {
  score?: number;
  compact?: boolean;
};

export function EventMatchCard({ compact = false, score = 94 }: EventMatchCardProps) {
  return (
    <article className={`eh-match-card ${compact ? "is-compact" : ""}`}>
      <div className="eh-match-card-cover" aria-hidden="true">
        <span className="eh-cover-date"><strong>12</strong>TH10</span>
        <i className="eh-cover-shape eh-cover-shape--one" />
        <i className="eh-cover-shape eh-cover-shape--two" />
        <i className="eh-cover-grid" />
      </div>
      <div className="eh-match-card-body">
        <div className="eh-match-card-heading">
          <div>
            <span className="eh-match-card-category">EVENTMATCH GỢI Ý</span>
            <h3>Tech Meetup Sài Gòn 2025</h3>
          </div>
          <MatchScoreRing compact={compact} score={score} />
        </div>
        <p className="eh-match-card-meta">Thứ bảy, 18:30 · Thiskyhall, TP.HCM</p>
        {compact ? (
          <p className="eh-match-reason">Khớp với sở thích Workshop ở TP.HCM</p>
        ) : (
          <div className="eh-match-card-footer">
            <div className="eh-auth-tags">
              <TagPill>Công nghệ</TagPill>
              <TagPill>Cuối tuần</TagPill>
            </div>
            <strong>Từ 150.000đ</strong>
          </div>
        )}
      </div>
    </article>
  );
}
