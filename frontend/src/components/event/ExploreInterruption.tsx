import { Link } from "react-router-dom";
import { MatchScoreRing, QrMark } from "../auth/AuthVisualPrimitives";
import { LineIcon } from "../ui/LineIcon";

export function ExploreInterruption() {
  return (
    <aside className="ev-explore-interruption">
      <div><span className="ev-eyebrow"><LineIcon name="sparkles" />EventMatch</span><h2>Chưa biết chọn sự kiện nào?</h2><p>Chọn vài sở thích, EventMatch sẽ tìm trải nghiệm hợp gu nhất.</p><Link to="/eventmatch">Thử EventMatch<LineIcon name="arrow-right" /></Link></div>
      <div className="ev-interruption-ticket" aria-hidden="true"><QrMark /><span><small>GỢI Ý CHO BẠN</small><strong>Workshop · TP.HCM</strong><em>Dưới 300k · Cuối tuần</em></span><MatchScoreRing compact score={94} /></div>
    </aside>
  );
}
