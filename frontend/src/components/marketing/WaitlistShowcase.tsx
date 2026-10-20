import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

const steps = [
  ["01", "Sự kiện hết vé", "ticket"],
  ["02", "Bạn vào danh sách chờ", "user"],
  ["03", "Có vé — EventHub báo ngay", "mail"],
] as const;

export function WaitlistShowcase() {
  return (
    <section className="ev-home-section ev-waitlist-section" id="tickets">
      <div className="ev-waitlist-ticket" aria-label="Vị trí trong danh sách chờ">
        <div><span>SMART WAITLIST</span><strong>Vị trí của bạn</strong><b>#3</b></div>
        <div className="ev-waitlist-progress"><i /><i /><i /><i /><i /></div>
        <small>Tuần lễ Công nghệ Sài Gòn · Sân khấu chính</small>
      </div>
      <div className="ev-waitlist-content">
        <span className="ev-eyebrow">Một cơ hội nữa</span>
        <h2>Hết vé không có nghĩa là hết hy vọng.</h2>
        <div className="ev-waitlist-timeline">
          {steps.map(([number, label, icon]) => <div key={number}><span><LineIcon name={icon} /></span><small>{number}</small><strong>{label}</strong></div>)}
        </div>
        <Link className="ev-text-link" to="/explore?filter=Sắp+hết+vé">Khám phá sự kiện sắp hết vé<LineIcon name="arrow-right" /></Link>
      </div>
    </section>
  );
}
