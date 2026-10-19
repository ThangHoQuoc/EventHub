import { useState } from "react";
import { Link } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { matchedEvents } from "../data/mockEvents";
import type { EventMatchPreferences } from "../types/event";

const examples = [
  "Concert ở Sài Gòn cuối tuần này",
  "Workshop UI/UX cho người mới bắt đầu",
  "Sự kiện networking dưới 300k",
  "Sự kiện công nghệ ở Hà Nội",
];

const preferences: EventMatchPreferences = {
  topic: "Công nghệ",
  city: "TP.HCM",
  dateRange: "Cuối tuần này",
  maxBudget: 300000,
  audienceLevel: "beginner",
  goal: "Networking / học thêm kỹ năng",
};

export function EventMatchPage() {
  const [query, setQuery] = useState("Tìm workshop công nghệ ở TP.HCM cuối tuần này dưới 300k");
  const [searched, setSearched] = useState(true);

  return (
    <div className="ev-editorial-page ev-eventmatch-page">
      {/* Input section */}
      <section className="ev-em-hero">
        <div className="ev-em-hero-inner">
          <div className="ev-em-copy">
            <span className="ev-eyebrow"><LineIcon name="sparkles" />EventMatch</span>
            <h1>Nói bằng tiếng Việt,<br />EventHub tìm đúng sự kiện.</h1>
            <p>Không cần lọc từng ô. Mô tả gu, lịch rảnh, thành phố và ngân sách — EventMatch sẽ xếp hạng sự kiện phù hợp.</p>

            <div className="ev-em-input-wrap">
              <div className="ev-em-input-row">
                <LineIcon name="sparkles" />
                <input
                  aria-label="Mô tả sự kiện bạn muốn tìm"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Mô tả gu, lịch rảnh, thành phố và ngân sách..."
                  value={query}
                />
                <button
                  className="ev-em-submit"
                  onClick={() => setSearched(true)}
                  type="button"
                >
                  Tìm bằng AI
                </button>
              </div>
              <div className="ev-em-chips">
                <span>Thử nhanh:</span>
                {examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => { setQuery(example); setSearched(true); }}
                    type="button"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="ev-em-preview" aria-label="Cách EventMatch phân tích nhu cầu">
            <span className="ev-em-preview-label">EventMatch đang đọc</span>
            <div className="ev-em-preview-query">"{query}"</div>
            <div className="ev-em-preview-tags">
              <div><small>Chủ đề</small><strong>Công nghệ / Workshop</strong></div>
              <div><small>Địa điểm</small><strong>TP.HCM</strong></div>
              <div><small>Ngân sách</small><strong>Dưới 300.000đ</strong></div>
              <div><small>Thời gian</small><strong>Cuối tuần</strong></div>
            </div>
          </aside>
        </div>
      </section>

      {/* Results */}
      <section className="ev-em-results">
        {searched ? (
          <>
            <div className="ev-em-understanding">
              <div>
                <span className="ev-eyebrow">Kết quả phân tích</span>
                <h2>EventMatch hiểu nhu cầu của bạn</h2>
              </div>
              <div className="ev-em-pref-grid">
                {[
                  ["map-pin", "Thành phố", preferences.city],
                  ["calendar", "Thời gian", preferences.dateRange],
                  ["ticket", "Ngân sách", `Dưới ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(preferences.maxBudget ?? 300000)}`],
                  ["trending", "Chủ đề", preferences.topic],
                  ["user", "Mục tiêu", preferences.goal],
                ].map(([icon, label, value]) => (
                  <div key={label}>
                    <LineIcon name={icon as never} />
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="ev-em-result-header">
              <div>
                <span className="ev-eyebrow">Kết quả phù hợp</span>
                <h2>EventMatch tìm thấy {matchedEvents.length} sự kiện</h2>
              </div>
              <Link className="ev-text-link" to="/explore">Xem tất cả <LineIcon name="arrow-right" /></Link>
            </div>
            <EventGrid events={matchedEvents} variant="match" />
          </>
        ) : (
          <EmptyState
            actionLabel="Khám phá tất cả sự kiện"
            actionTo="/explore"
            description="Thử mô tả rộng hơn hoặc đổi thành phố."
            title="Chưa tìm thấy sự kiện phù hợp"
          />
        )}
      </section>
    </div>
  );
}
