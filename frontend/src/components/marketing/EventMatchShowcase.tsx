import { useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const questions = [
  {
    id: "city",
    label: "Điểm đến yêu thích",
    icon: "map-pin" as const,
    options: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Đà Lạt"],
  },
  {
    id: "company",
    label: "Bạn đi cùng ai?",
    icon: "user" as const,
    options: ["Một mình", "Bạn bè", "Người yêu & Gia đình"],
  },
  {
    id: "budget",
    label: "Khoảng ngân sách",
    icon: "ticket" as const,
    options: ["Dưới 300k", "300k – 700k", "Trên 700k", "Miễn phí"],
  },
  {
    id: "time",
    label: "Thời gian thích hợp",
    icon: "calendar" as const,
    options: ["Tối nay", "Cuối tuần này", "Tháng này"],
  },
] as const;

const fallbackEvents = [
  {
    id: "match-1",
    title: "Triển Lãm Nghệ Thuật Đương Đại: Những Chiều Ký Ức",
    category: "Thiết kế & Nghệ thuật",
    location: "Bảo tàng Mỹ thuật · TP.HCM",
    timeText: "19:30 · Thứ Bảy tuần này",
    reason: "Khớp điểm đến TP.HCM & vibe cuối tuần thư giãn",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    matchScore: 98,
  },
  {
    id: "match-2",
    title: "Đêm Nhạc Acoustic: Mùa Gió Lộng & Ký Ức",
    category: "Âm nhạc & Concert",
    location: "Soul Live Project · TP.HCM",
    timeText: "20:00 · Tối Chủ Nhật",
    reason: "Tối ưu ngân sách dưới 300k, phù hợp đi cùng bạn bè",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    matchScore: 95,
  },
  {
    id: "match-3",
    title: "Vietnam Tech Innovators & Founder Summit 2026",
    category: "Công nghệ & Khởi nghiệp",
    location: "White Palace · TP.HCM",
    timeText: "08:30 · Thứ Bảy tuần tới",
    reason: "Sự kiện xu hướng được nhiều người cùng sở thích lựa chọn",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    matchScore: 92,
  },
];

export function EventMatchShowcase({ events }: { events: Event[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({
    city: "TP.HCM",
    company: "Bạn bè",
    budget: "Dưới 300k",
    time: "Cuối tuần này",
  });

  const displayEvents =
    events && events.length >= 3
      ? events.slice(0, 3).map((event, idx) => ({
          id: event.id,
          title: event.title,
          category: event.category || "Sự kiện",
          location: event.city ? `${event.city} · ${event.location}` : event.location || "Toàn quốc",
          timeText: new Date(event.startAt).toLocaleDateString("vi-VN", {
            weekday: "short",
            month: "numeric",
            day: "numeric",
          }),
          reason:
            event.matchReason ||
            (idx === 0
              ? `Khớp hoàn hảo với điểm đến ${answers.city} & vibe ${answers.company}`
              : idx === 1
              ? `Tối ưu ngân sách ${answers.budget}, diễn ra vào ${answers.time}`
              : "Sự kiện xu hướng có độ tương thích cao"),
          imageUrl:
            event.imageUrl ||
            fallbackEvents[idx]?.imageUrl ||
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
          matchScore: event.matchScore ?? (98 - idx * 3),
        }))
      : fallbackEvents.map((item, idx) => ({
          ...item,
          reason:
            idx === 0
              ? `Khớp hoàn hảo với điểm đến ${answers.city} & vibe ${answers.company}`
              : idx === 1
              ? `Tối ưu ngân sách ${answers.budget}, diễn ra vào ${answers.time}`
              : item.reason,
        }));

  return (
    <section className="ev-home-section ev-match-showcase-section">
      <SectionHeader
        eyebrow="Gợi ý dành riêng cho bạn"
        title="Để EventMatch chọn giúp bạn"
        description="Bốn lựa chọn nhanh. Gợi ý sự kiện đúng gu ngay lập tức."
        action={{ label: "Khám phá tất cả gợi ý", to: "/eventmatch" }}
      />

      <div className="ev-match-bento-hub">
        {/* CỘT TRÁI: BỘ CHỌN GU ĐA TẦNG SINH ĐỘNG (INTERACTIVE PROFILE) */}
        <div className="ev-match-profile-side">
          <div className="ev-match-side-header">
            <div className="ev-match-header-icon">
              <LineIcon name="sparkles" />
            </div>
            <div>
              <h3>Tùy chỉnh sở thích của bạn</h3>
              <p>Chọn các tiêu chí bên dưới để hệ thống tinh chỉnh gợi ý theo thời gian thực.</p>
            </div>
          </div>

          <div className="ev-match-steps-list">
            {questions.map((q) => (
              <div className="ev-match-step-card" key={q.id}>
                <div className="ev-step-title-line">
                  <LineIcon name={q.icon} />
                  <span>{q.label}</span>
                </div>

                <div className="ev-step-pills">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`ev-step-pill ${isSelected ? "is-selected" : ""}`}
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
          </div>

          {/* Thước đo độ khớp gu trực quan */}
          <div className="ev-match-meter-box">
            <div className="ev-meter-header">
              <span>Độ tương thích ước tính:</span>
              <strong>96% (Rất cao)</strong>
            </div>
            <div className="ev-meter-track">
              <div className="ev-meter-fill" style={{ width: "96%" }} />
            </div>
            <small>Đang ghép gu cho khu vực {answers.city} · {answers.company}</small>
          </div>

          <Link to="/eventmatch" className="ev-match-explore-cta">
            <span>Mở rộng bộ lọc gu chi tiết</span>
            <LineIcon name="arrow-right" />
          </Link>
        </div>

        {/* CỘT PHẢI: 3 THẺ SỰ KIỆN GỢI Ý ĐẦY ĐẶN & SANG TRỌNG */}
        <div className="ev-match-results-side">
          <div className="ev-results-side-head">
            <div className="ev-head-badge">
              <LineIcon name="ticket" />
              <span>GỢI Ý TƯƠNG THÍCH CAO NHẤT</span>
            </div>
            <span className="ev-match-auto-tag">Tự động cập nhật</span>
          </div>

          <div className="ev-match-cards-stack">
            {displayEvents.map((item) => (
              <Link
                key={item.id}
                to={`/events/${item.id}`}
                className="ev-match-rich-card"
              >
                {/* Poster Thumbnail */}
                <div className="ev-rich-card-thumb">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <span className="ev-rich-cat-tag">{item.category}</span>
                </div>

                {/* Nội dung thông tin */}
                <div className="ev-rich-card-content">
                  <h4 className="ev-rich-card-title">{item.title}</h4>

                  <div className="ev-rich-card-meta">
                    <span className="meta-item">
                      <LineIcon name="calendar" />
                      <span>{item.timeText}</span>
                    </span>
                    <span className="meta-item">
                      <LineIcon name="map-pin" />
                      <span>{item.location}</span>
                    </span>
                  </div>

                  <div className="ev-rich-reason-pill">
                    <LineIcon name="sparkles" />
                    <span>{item.reason}</span>
                  </div>
                </div>

                {/* Vòng điểm Match Score */}
                <div className="ev-rich-score-wrap">
                  <div className="ev-rich-score-circle">
                    <strong>{item.matchScore}%</strong>
                    <small>Độ hợp</small>
                  </div>
                  <span className="ev-rich-view-btn">
                    <span>Xem vé</span>
                    <LineIcon name="arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
