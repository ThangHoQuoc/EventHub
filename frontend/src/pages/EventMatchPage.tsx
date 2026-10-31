import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { LineIcon } from "../components/ui/LineIcon";
import { EmptyState } from "../components/ui/EmptyState";
import { matchEventsApi } from "../api/events";
import type { Event } from "../types/event";

const examples = [
  "Concert ở Sài Gòn cuối tuần này",
  "Workshop UI/UX cho người mới bắt đầu",
  "Sự kiện networking dưới 300k",
  "Sự kiện công nghệ ở Hà Nội",
];

export function EventMatchPage() {
  const [query, setQuery] = useState("Tìm workshop công nghệ ở TP.HCM cuối tuần này dưới 300k");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedList, setMatchedList] = useState<Event[]>([]);
  const [preferences, setPreferences] = useState({
    city: "TP.HCM",
    topic: "Công nghệ",
    maxBudget: 300000,
    dateRange: "Cuối tuần này",
    goal: "Học hỏi & Trải nghiệm",
  });

  async function handleSearch(customQuery?: string) {
    const activeText = (customQuery ?? query).trim();
    if (!activeText) return;

    setAnalyzing(true);
    try {
      const res = await matchEventsApi(activeText);
      const parsed = res.parsedPreferences;

      setPreferences({
        city: parsed.city || "Toàn quốc",
        topic: parsed.category || "Tổng hợp",
        maxBudget: parsed.maxPrice !== undefined ? parsed.maxPrice : 500000,
        dateRange: parsed.timeRange || "Linh hoạt",
        goal: "Trải nghiệm & Kết nối",
      });

      const converted: Event[] = (res.matches || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        city: (item.city as Event["city"]) || "TP.HCM",
        location: item.location,
        startAt: item.startAt,
        endAt: item.endAt,
        imageUrl: item.thumbnailUrl || "",
        category: item.category || "Sự kiện",
        tags: item.tags && item.tags.length > 0 ? item.tags : [item.category || "Sự kiện"],
        minPrice: item.minPrice || 0,
        priceKnown: true,
        status: "PUBLISHED",
        ticketAvailability: item.availableQuantity > 0 ? "AVAILABLE" : "SOLD_OUT",
        matchScore: item.matchScore,
        matchReason: item.matchReason,
      }));

      setMatchedList(converted);
    } catch (err) {
      console.error("Failed to match events with backend API", err);
    } finally {
      setAnalyzing(false);
    }
  }

  // Khởi động tìm kiếm lần đầu khi tải trang
  useEffect(() => {
    handleSearch(query);
  }, []);

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
              <LineIcon name="sparkles" /> EventMatch AI Assistant
            </span>
            <h1>
              Nói bằng tiếng Việt,
              <br />
              EventHub tìm đúng sự kiện.
            </h1>
            <p>
              Không cần lọc từng ô phức tạp. Bạn chỉ cần mô tả gu, lịch rảnh, thành phố và ngân
              sách — EventMatch sẽ bóc tách nhu cầu và xếp hạng các sự kiện ăn ý nhất với bạn từ hệ thống.
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
