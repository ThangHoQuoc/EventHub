import { useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { LineIcon } from "../ui/LineIcon";

const questions = [
  {
    id: "city",
    label: "Bạn muốn đi đâu?",
    options: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Đà Lạt"],
  },
  {
    id: "company",
    label: "Đi cùng ai?",
    options: ["Một mình", "Bạn bè", "Người yêu / Gia đình"],
  },
  {
    id: "budget",
    label: "Ngân sách mong muốn?",
    options: ["Dưới 300k", "300k - 700k", "Trên 700k", "Miễn phí"],
  },
  {
    id: "time",
    label: "Thời gian thích hợp?",
    options: ["Tối nay", "Cuối tuần này", "Tháng này"],
  },
] as const;

// Fallback high-quality curated events if props.events is empty or has fewer items
const fallbackEvents: Array<{
  id: string | number;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  matchScore: number;
  matchReason: string;
}> = [
  {
    id: "match-101",
    title: "Indie Acoustic Night - Mùa Gió Lộng",
    category: "Âm nhạc",
    location: "TP.HCM • Soul Live Project",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    matchScore: 98,
    matchReason: "Chuẩn gu acoustic mộc mạc, phù hợp cuối tuần thư giãn cùng bạn bè.",
  },
  {
    id: "match-102",
    title: "Vietnam Tech Innovators Summit 2026",
    category: "Công nghệ",
    location: "TP.HCM • White Palace Hoàng Văn Thụ",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    matchScore: 94,
    matchReason: "Networking đỉnh cao, vé early bird phù hợp ngân sách đăng ký trước.",
  },
  {
    id: "match-103",
    title: "Triển lãm Nghệ thuật Thị giác: 'Mảnh Thời Gian'",
    category: "Nghệ thuật",
    location: "Hà Nội • VCCA Vincom Royal City",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    matchScore: 91,
    matchReason: "Không gian mở tương tác nghệ thuật, vé sinh viên dưới 150k.",
  },
];

export function EventMatchShowcase({ events }: { events: Event[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({
    city: "TP.HCM",
    company: "Bạn bè",
    budget: "Dưới 300k",
    time: "Cuối tuần này",
  });

  // Prepare display items from actual events or fallback
  const displayItems =
    events && events.length >= 3
      ? events.slice(0, 3).map((event, idx) => ({
          id: event.id,
          title: event.title,
          category: event.category || "Sự kiện",
          location: event.city ? `${event.city} • ${event.location}` : event.location || "Toàn quốc",
          imageUrl:
            event.imageUrl ||
            fallbackEvents[idx]?.imageUrl ||
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
          matchScore: event.matchScore ?? (98 - idx * 4),
          matchReason:
            event.matchReason ||
            (idx === 0
              ? `Khớp hoàn hảo với lựa chọn ${answers.city} & vibe ${answers.company}.`
              : idx === 1
              ? `Tối ưu ngân sách ${answers.budget}, diễn ra vào ${answers.time}.`
              : "Sự kiện xu hướng được nhiều người cùng gu yêu thích."),
        }))
      : fallbackEvents.map((item, idx) => ({
          ...item,
          matchReason:
            idx === 0
              ? `Khớp hoàn hảo với lựa chọn ${answers.city} & vibe ${answers.company}.`
              : idx === 1
              ? `Tối ưu ngân sách ${answers.budget}, diễn ra vào ${answers.time}.`
              : item.matchReason,
        }));

  return (
    <section className="ev-eventmatch-section">
      <div className="ev-ai-showcase-container">
        {/* Header với AI Glow Badge */}
        <div className="ev-ai-showcase-header">
          <div>
            <div className="ev-ai-badge">
              <LineIcon name="sparkles" />
              <span>EventMatch AI • Trợ lý ghép gu thông minh</span>
            </div>
            <h2>Khám phá sự kiện chuẩn gu bạn chỉ trong 3 giây.</h2>
            <p>
              Chọn nhanh 4 tiêu chí bên dưới, hệ thống AI sẽ phân tích phong cách và đề xuất sự kiện lý tưởng nhất.
            </p>
          </div>
          <Link to="/eventmatch" className="ev-ai-cta-btn">
            <span>Mở rộng bộ lọc gu chi tiết</span>
            <LineIcon name="arrow-right" />
          </Link>
        </div>

        {/* 2 Cột: Bên trái Quiz tương tác, bên phải Thẻ kết quả gợi ý trực tiếp */}
        <div className="ev-ai-grid-layout">
          {/* CỘT TRÁI: INTERACTIVE QUIZ */}
          <div className="ev-ai-quiz-panel">
            {questions.map((q) => (
              <div className="ev-ai-quiz-group" key={q.id}>
                <fieldset>
                  <legend>
                    <LineIcon name="sparkles" />
                    {q.label}
                  </legend>
                  <div className="ev-ai-options-wrap">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className="ev-ai-option-btn"
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
                </fieldset>
              </div>
            ))}

            <Link to="/eventmatch" className="ev-ai-cta-btn" style={{ marginTop: "12px" }}>
              <span>Xem tất cả sự kiện đã ghép gu</span>
              <LineIcon name="arrow-right" />
            </Link>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ GỢI Ý TỰ ĐỘNG - LUÔN ĐẦY ĐẶN & BẮT MẮT */}
          <div className="ev-ai-results-panel">
            <div className="ev-ai-results-bar">
              <span>🎯 3 sự kiện có độ tương thích cao nhất</span>
              <div className="ev-ai-pulse-status">
                <span className="ev-ai-pulse-dot" />
                <span>AI Realtime Match</span>
              </div>
            </div>

            {displayItems.map((item) => (
              <Link
                key={item.id}
                to={`/events/${item.id}`}
                className="ev-ai-card-item"
              >
                <div className="ev-ai-thumb">
                  <img src={item.imageUrl} alt={item.title} loading="lazy" />
                </div>

                <div className="ev-ai-info">
                  <div className="ev-ai-tag-row">
                    <span className="ev-ai-category-tag">{item.category}</span>
                    <span className="ev-ai-city-text">{item.location}</span>
                  </div>
                  <h4 className="ev-ai-title">{item.title}</h4>
                  <p className="ev-ai-reason">
                    <LineIcon name="sparkles" />
                    <span>{item.matchReason}</span>
                  </p>
                </div>

                <div className="ev-ai-score-badge">
                  <span className="ev-ai-score-num">{item.matchScore}%</span>
                  <span className="ev-ai-score-lbl">Độ hợp</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
