import { useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "../../types/event";
import { MatchScoreRing } from "../auth/AuthVisualPrimitives";
import { EventPoster } from "../event/EventPoster";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const questions = [
  { id: "city", label: "Bạn muốn đi đâu?", options: ["TP.HCM", "Hà Nội", "Đà Nẵng"] },
  { id: "company", label: "Đi với ai?", options: ["Một mình", "Bạn bè", "Gia đình"] },
  { id: "budget", label: "Ngân sách?", options: ["Dưới 300k", "300k–700k", "Trên 700k"] },
  { id: "time", label: "Thời gian rảnh?", options: ["Tối trong tuần", "Cuối tuần"] },
] as const;

export function EventMatchShowcase({ events }: { events: Event[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({ city: "TP.HCM", company: "Bạn bè", budget: "Dưới 300k", time: "Cuối tuần" });

  return (
    <section className="ev-eventmatch-section">
      <div className="ev-home-section">
        <SectionHeader eyebrow="Gợi ý dành riêng cho bạn" title="Để EventMatch chọn giúp bạn" description="Bốn lựa chọn nhanh. Một danh sách đúng gu." />
        <div className="ev-eventmatch-layout">
          <div className="ev-match-quiz">
            {questions.map((question) => (
              <fieldset key={question.id}>
                <legend>{question.label}</legend>
                <div>
                  {question.options.map((option) => {
                    const active = answers[question.id] === option;
                    return <button aria-pressed={active} key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} type="button">{active ? <LineIcon name="check" /> : null}{option}</button>;
                  })}
                </div>
              </fieldset>
            ))}
            <Link className="ev-primary-link" to="/eventmatch">Thử EventMatch<LineIcon name="arrow-right" /></Link>
          </div>

          <div className="ev-match-connector" aria-hidden="true"><span>EventMatch đang ghép gu</span></div>

          <div className="ev-match-results" aria-label="Các sự kiện được EventMatch gợi ý">
            {events.slice(0, 3).map((event, index) => (
              <article className="ev-match-result" key={event.id}>
                <EventPoster event={event} variant="wide" />
                <div><small>{event.category}</small><h3>{event.title}</h3><p>{event.matchReason}</p></div>
                <MatchScoreRing compact score={event.matchScore ?? [94, 89, 85][index]} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
