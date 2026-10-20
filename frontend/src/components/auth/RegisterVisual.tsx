import { EventMatchCard, SparkleIcon, TagPill } from "./AuthVisualPrimitives";

const benefits = [
  "Gợi ý EventMatch theo sở thích",
  "Vé điện tử luôn trong tầm tay",
  "Tự động vào danh sách chờ",
];

export function RegisterVisual() {
  return (
    <div className="eh-auth-visual-inner">
      <div className="eh-auth-copy">
        <span className="eh-auth-eyebrow"><SparkleIcon /> Cá nhân hóa trải nghiệm</span>
        <h1>Tạo tài khoản <span>EventHub</span></h1>
        <p>
          Lưu sở thích, nhận gợi ý EventMatch phù hợp, quản lý vé và tham gia danh sách
          chờ khi sự kiện hết chỗ.
        </p>
      </div>

      <div className="eh-onboarding-flow" aria-label="Cách EventMatch cá nhân hóa gợi ý">
        <section className="eh-preference-card">
          <div className="eh-preference-profile">
            <span className="eh-preference-avatar">MA</span>
            <div><strong>Sở thích của bạn</strong><small>3 tiêu chí đã chọn</small></div>
          </div>
          <div className="eh-preference-tags">
            <TagPill>✓ TP.HCM</TagPill>
            <TagPill>✓ Workshop</TagPill>
            <TagPill>✓ Dưới 300k</TagPill>
            <span className="eh-add-tag">+ Thêm</span>
          </div>
        </section>
        <span className="eh-flow-connector" aria-hidden="true"><i /><b>EventMatch</b><i /></span>
        <EventMatchCard compact score={92} />
        <span className="eh-waitlist-chip">Danh sách chờ <i /> Vị trí <strong>#3</strong></span>
      </div>

      <ul className="eh-auth-benefits">
        {benefits.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}
      </ul>
    </div>
  );
}
