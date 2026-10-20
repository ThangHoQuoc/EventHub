import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

export function TicketBanner() {
  return (
    <section className="ev-home-section ev-final-section">
      <div className="ev-ticket-banner">
        <div className="ev-ticket-banner-copy">
          <span>EVENTHUB · VIỆT NAM</span>
          <h2>Sự kiện tiếp theo của bạn đang ở đây.</h2>
          <div><Link to="/explore">Khám phá ngay<LineIcon name="arrow-right" /></Link><Link to="/my-tickets">Vé của tôi</Link></div>
        </div>
        <div className="ev-ticket-banner-stub"><LineIcon name="ticket" /><span><small>VÉ ĐIỆN TỬ</small><strong>EVENTHUB</strong></span></div>
      </div>
    </section>
  );
}
