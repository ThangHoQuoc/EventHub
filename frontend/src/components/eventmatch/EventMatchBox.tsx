import { useState } from "react";
import { Button } from "../ui/Button";

type EventMatchBoxProps = {
  onSubmit?: (query: string) => void;
};

const examples = [
  "Concert ở Sài Gòn cuối tuần này",
  "Workshop UI/UX cho người mới",
  "Sự kiện networking dưới 300k",
  "Sự kiện công nghệ ở Hà Nội",
];

export function EventMatchBox({ onSubmit }: EventMatchBoxProps) {
  const [query, setQuery] = useState("Tìm workshop công nghệ ở TP.HCM cuối tuần này dưới 300k");

  return (
    <section className="eventmatch-box">
      <div className="eventmatch-copy">
        <span className="landing-kicker">EventMatch AI</span>
        <h1>Nói bằng tiếng Việt, EventHub tìm đúng sự kiện.</h1>
        <p>Không cần lọc từng ô. Bạn chỉ cần mô tả gu, lịch rảnh, thành phố và ngân sách — EventMatch sẽ đọc nhu cầu rồi xếp hạng sự kiện phù hợp.</p>
        <div className="eventmatch-input-row">
          <input
            aria-label="Mô tả sự kiện bạn muốn tìm"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
          <Button onClick={() => onSubmit?.(query)}>Tìm bằng AI</Button>
        </div>
        <div className="quick-chips">
          {examples.map((example) => (
            <button key={example} onClick={() => setQuery(example)} type="button">
              {example}
            </button>
          ))}
        </div>
      </div>
      <aside className="eventmatch-ai-card" aria-label="Minh họa cách EventMatch phân tích">
        <span>AI intent map</span>
        <strong>{query}</strong>
        <div>
          <small>Chủ đề</small>
          <b>Công nghệ / Workshop</b>
        </div>
        <div>
          <small>Ngân sách</small>
          <b>Dưới 300.000đ</b>
        </div>
        <div>
          <small>Độ phù hợp</small>
          <b>94%</b>
        </div>
      </aside>
    </section>
  );
}
