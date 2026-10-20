import { useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { matchedEvents, mockEvents } from "../data/mockEvents";
import type { Event, EventMatchPreferences } from "../types/event";

const examples = [
  "Concert ở Sài Gòn cuối tuần này",
  "Workshop UI/UX cho người mới bắt đầu",
  "Sự kiện networking dưới 300k",
  "Sự kiện công nghệ ở Hà Nội",
];

export function EventMatchPage() {
  const [query, setQuery] = useState("Tìm workshop công nghệ ở TP.HCM cuối tuần này dưới 300k");
  const [isSearching, startTransition] = useTransition();
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedList, setMatchedList] = useState<Event[]>(matchedEvents);

  // Phân tích intent động dựa trên query người dùng
  const parseQuery = (text: string): EventMatchPreferences => {
    const lower = text.toLowerCase();
    const city = lower.includes("hà nội")
      ? "Hà Nội"
      : lower.includes("đà nẵng")
      ? "Đà Nẵng"
      : "TP.HCM";

    let topic = "Công nghệ & Kỹ năng";
    if (lower.includes("nhạc") || lower.includes("concert") || lower.includes("indie")) {
      topic = "Âm nhạc / Concert";
    } else if (lower.includes("ux") || lower.includes("thiết kế") || lower.includes("design")) {
      topic = "Thiết kế & Sáng tạo";
    } else if (lower.includes("networking") || lower.includes("startup") || lower.includes("kinh doanh")) {
      topic = "Kinh doanh & Khởi nghiệp";
    }

    let maxBudget = 500000;
    if (lower.includes("miễn phí") || lower.includes("free")) maxBudget = 0;
    else if (lower.includes("300k") || lower.includes("300.000")) maxBudget = 300000;
    else if (lower.includes("200k") || lower.includes("200.000")) maxBudget = 200000;

    const dateRange = lower.includes("cuối tuần")
      ? "Cuối tuần này"
      : lower.includes("tối")
      ? "Tối nay"
      : "Tháng này";

    return {
      city,
      topic,
      maxBudget,
      dateRange,
      goal: "Học hỏi & Trải nghiệm",
      audienceLevel: "beginner",
    };
  };

  const [preferences, setPreferences] = useState<EventMatchPreferences>(() => parseQuery(query));

  function handleSearch(customQuery?: string) {
    const activeText = customQuery ?? query;
    if (!activeText.trim()) return;

    setAnalyzing(true);
    const parsed = parseQuery(activeText);
    setPreferences(parsed);

    setTimeout(() => {
      startTransition(() => {
        // Lọc và xếp hạng sự kiện theo gu
        const results = mockEvents
          .map((item) => {
            let score = 75;
            if (item.city === parsed.city) score += 10;
            if (parsed.topic && item.category.toLowerCase().includes(parsed.topic.slice(0, 4).toLowerCase())) score += 10;
            if (item.minPrice <= (parsed.maxBudget ?? 500000)) score += 5;
            return {
              ...item,
              matchScore: Math.min(score, 98),
              matchReason: `Phù hợp với chủ đề ${parsed.topic}, tại ${parsed.city} và ngân sách dự kiến.`,
            };
          })
          .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

        setMatchedList(results.slice(0, 4));
        setAnalyzing(false);
      });
    }, 350);
  }

  function handleExampleClick(example: string) {
    setQuery(example);
    handleSearch(example);
  }

  return (
    <div className="ev-editorial-page ev-eventmatch-page">
      {/* Hero section */}
      <section className="ev-em-hero">
        <div className="ev-em-hero-inner">
          <div className="ev-em-copy">
            <span className="ev-eyebrow">
              <LineIcon name="sparkles" /> EventMatch AI
            </span>
            <h1>
              Nói bằng tiếng Việt,
              <br />
              EventHub tìm đúng sự kiện.
            </h1>
            <p>
              Không cần lọc từng ô phức tạp. Bạn chỉ cần mô tả gu, lịch rảnh, thành phố và ngân
              sách — EventMatch sẽ bóc tách nhu cầu và xếp hạng các sự kiện ăn ý nhất với bạn.
            </p>

            <div className="ev-em-input-wrap">
              <div className="ev-em-input-row">
                <LineIcon name="sparkles" />
                <input
                  aria-label="Mô tả sự kiện bạn muốn tìm"
                  disabled={analyzing}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ví dụ: Tìm đêm nhạc acoustic ở Sài Gòn cuối tuần này dưới 250k..."
                  value={query}
                />
                <button
                  className="ev-em-submit"
                  disabled={analyzing || !query.trim()}
                  onClick={() => handleSearch()}
                  type="button"
                >
                  {analyzing ? "Đang phân tích..." : "Tìm bằng AI"}
                </button>
              </div>

              <div className="ev-em-chips">
                <span>Gợi ý thử nhanh:</span>
                {examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    type="button"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="ev-em-preview" aria-label="Cách EventMatch phân tích nhu cầu">
            <span className="ev-em-preview-label">
              <LineIcon name="sparkles" /> AI Intent Parsing
            </span>
            <div className="ev-em-preview-query">"{query}"</div>
            <div className="ev-em-preview-tags">
              <div>
                <small>Chủ đề nhận diện</small>
                <strong>{preferences.topic}</strong>
              </div>
              <div>
                <small>Thành phố</small>
                <strong>{preferences.city}</strong>
              </div>
              <div>
                <small>Ngân sách tối đa</small>
                <strong>
                  {preferences.maxBudget === 0
                    ? "Miễn phí"
                    : `Dưới ${preferences.maxBudget?.toLocaleString("vi-VN")}đ`}
                </strong>
              </div>
              <div>
                <small>Khung thời gian</small>
                <strong>{preferences.dateRange}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Results Section */}
      <section className="ev-em-results">
        <div className="ev-em-understanding">
          <div>
            <span className="ev-eyebrow">Trí tuệ nhân tạo</span>
            <h2>EventMatch hiểu nhu cầu của bạn</h2>
          </div>
          <div className="ev-em-pref-grid">
            {[
              ["map-pin", "Thành phố", preferences.city],
              ["calendar", "Thời gian", preferences.dateRange],
              [
                "ticket",
                "Ngân sách",
                preferences.maxBudget === 0
                  ? "Miễn phí"
                  : `Dưới ${preferences.maxBudget?.toLocaleString("vi-VN")}đ`,
              ],
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
            <span className="ev-eyebrow">Kết quả đề xuất</span>
            <h2>
              {matchedList.length > 0
                ? `EventMatch tìm thấy ${matchedList.length} sự kiện tương thích cao`
                : "Chưa có sự kiện khớp hoàn toàn"}
            </h2>
          </div>
          <Link className="ev-text-link" to="/explore">
            Khám phá tất cả <LineIcon name="arrow-right" />
          </Link>
        </div>

        {matchedList.length > 0 ? (
          <EventGrid events={matchedList} variant="match" />
        ) : (
          <EmptyState
            actionLabel="Khám phá tất cả sự kiện"
            actionTo="/explore"
            description="Thử thay đổi ngân sách hoặc mô tả rộng hơn để tìm được nhiều lựa chọn hơn."
            title="Chưa tìm thấy sự kiện phù hợp"
          />
        )}
      </section>
    </div>
  );
}
