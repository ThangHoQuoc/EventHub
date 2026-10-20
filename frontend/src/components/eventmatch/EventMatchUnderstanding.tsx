import type { EventMatchPreferences } from "../../types/event";

type EventMatchUnderstandingProps = {
  preferences: EventMatchPreferences;
};

export function EventMatchUnderstanding({ preferences }: EventMatchUnderstandingProps) {
  const entries = [
    ["Chủ đề", preferences.topic],
    ["Thành phố", preferences.city],
    ["Thời gian", preferences.dateRange],
    ["Ngân sách", preferences.maxBudget ? `Dưới ${preferences.maxBudget.toLocaleString("vi-VN")}đ` : undefined],
    ["Mục tiêu", preferences.goal],
  ].filter(([, value]) => value);

  return (
    <section className="understanding-panel">
      <span className="eyebrow">EventMatch đã hiểu</span>
      <div className="preference-grid">
        {entries.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
