import { EventMatchCard, SparkleIcon, StatItem, TicketCard } from "./AuthVisualPrimitives";

export function LoginVisual() {
  return (
    <div className="eh-auth-visual-inner">
      <div className="eh-auth-copy">
        <span className="eh-auth-eyebrow"><SparkleIcon /> EventMatch bằng AI</span>
        <h1>Tìm sự kiện <span>hợp gu</span> của bạn</h1>
        <p>
          Khám phá sự kiện phù hợp với sở thích, nhận gợi ý từ AI và quản lý toàn bộ vé
          của bạn ở một nơi.
        </p>
      </div>

      <div className="eh-login-collage" aria-label="Gợi ý sự kiện dành riêng cho bạn">
        <TicketCard />
        <EventMatchCard />
        <span className="eh-saved-chip">
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M5.5 3.2h9v14L10 14.3l-4.5 2.9v-14Z" /></svg>
          Đã lưu 3 sự kiện
        </span>
      </div>

      <div className="eh-auth-stats" aria-label="Thống kê EventHub">
        <StatItem label="sự kiện tuần này" value="36" />
        <StatItem label="thành phố" value="8" />
        <StatItem label="điểm trải nghiệm" value="4.8/5" />
      </div>
    </div>
  );
}
