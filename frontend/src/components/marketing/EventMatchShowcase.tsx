import { useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const questions = [
  {
    id: "city",
    label: "Bạn muốn đi đâu?",
    options: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Đà Lạt"],
  },
  {
    id: "company",
    label: "Đi cùng ai?",
    options: ["Một mình", "Bạn bè", "Gia đình"],
  },
  {
    id: "budget",
    label: "Ngân sách?",
    options: ["Dưới 300k", "300k – 700k", "Trên 700k"],
  },
  {
    id: "time",
    label: "Thời gian rảnh?",
    options: ["Tối nay", "Cuối tuần", "Tuần tới"],
  },
] as const;

const fallbackEvents = [
  {
    id: "match-1",
    title: "Triển Lãm Nghệ Thuật Đương Đại: Những Chiều Ký Ức",
    category: "Nghệ thuật",
    location: "TP.HCM · Bảo tàng Mỹ thuật",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    matchScore: 98,
  },
  {
    id: "match-2",
    title: "Đêm Nhạc Acoustic: Mùa Gió Lộng",
    category: "Âm nhạc",
    location: "TP.HCM · Soul Live Project",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    matchScore: 94,
  },
  {
    id: "match-3",
    title: "Vietnam Tech & Startup Founder Night 2026",
    category: "Công nghệ",
    location: "Đà Nẵng · Enouvo Space",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    matchScore: 91,
  },
];

export function EventMatchShowcase({ events }: { events: Event[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({
    city: "TP.HCM",
    company: "Bạn bè",
    budget: "Dưới 300k",
    time: "Cuối tuần",
  });

  const displayEvents =
    events && events.length >= 3
      ? events.slice(0, 3).map((event, idx) => ({
          id: event.id,
          title: event.title,
          category: event.category || "Sự kiện",
          location: event.city ? `${event.city} · ${event.location}` : event.location || "Toàn quốc",
          imageUrl:
            event.imageUrl ||
            fallbackEvents[idx]?.imageUrl ||
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
          matchScore: event.matchScore ?? (98 - idx * 4),
        }))
      : fallbackEvents;

  return (
    <section className="ev-home-section ev-match-showcase-section">
      <SectionHeader
        eyebrow="Gợi ý dành riêng cho bạn"
        title="Để EventMatch chọn giúp bạn"
        description="Bốn lựa chọn nhanh. Gợi ý sự kiện đúng gu ngay lập tức."
        action={{ label: "Khám phá tất cả gợi ý", to: "/eventmatch" }}
      />

      <div className="ev-match-showcase-box">
        {/* CỘT TRÁI: BỘ CHỌN GU GỌN GÀNG, KHÔNG RƯỜM RÀ */}
        <div className="ev-match-filter-panel">
          {questions.map((q) => (
            <div className="ev-match-filter-group" key={q.id}>
              <span className="ev-match-filter-label">{q.label}</span>
              <div className="ev-match-pill-group">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`ev-match-pill-btn ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: opt,
                        }))
                      }
                    >
                      {isSelected && <LineIcon name="check" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Link to="/eventmatch" className="ev-match-submit-btn">
            <span>Xem sự kiện đã ghép gu</span>
            <LineIcon name="arrow-right" />
          </Link>
        </div>

        {/* CỘT PHẢI: 3 THẺ SỰ KIỆN GỢI Ý ĐẸP MẮT, TINH TẾ */}
        <div className="ev-match-cards-panel">
          <div className="ev-match-cards-header">
            <h4>Sự kiện phù hợp nhất</h4>
            <span className="ev-match-counter">Độ khớp cao</span>
          </div>

          <div className="ev-match-cards-list">
            {displayEvents.map((item) => (
              <Link
                key={item.id}
                to={`/events/${item.id}`}
                className="ev-match-item-card"
              >
                <div className="ev-match-thumb">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                </div>

                <div className="ev-match-info">
                  <div className="ev-match-meta-line">
                    <span className="ev-match-category-tag">{item.category}</span>
                    <span className="ev-match-location-text">{item.location}</span>
                  </div>
                  <h3 className="ev-match-item-title">{item.title}</h3>
                </div>

                <div className="ev-match-score-badge">
                  <strong>{item.matchScore}%</strong>
                  <small>Độ hợp</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
