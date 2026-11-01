import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

export function TicketBanner() {
  return (
    <section className="ev-ticket-banner-wrap">
      <div className="ev-vip-pass-banner">
        {/* Phần Trái: Headline, Feature Badges & Call to Action */}
        <div className="ev-vip-pass-content">
          <div className="ev-vip-pill-top">
            <LineIcon name="sparkles" />
            <span>EventHub Pass • Nâng tầm trải nghiệm</span>
          </div>

          <h2>Sự kiện tiếp theo của bạn đang chờ đón.</h2>

          <p>
            Hàng trăm concert âm nhạc, lễ hội ngoài trời, triển lãm nghệ thuật và hội thảo công nghệ
            đang diễn ra mỗi ngày. Đặt chỗ an toàn, nhận vé tức thì và vào cổng không chạm.
          </p>

          <div className="ev-vip-features">
            <div className="ev-vip-feature-item">
              <LineIcon name="sparkles" />
              <span>Giữ chỗ tức thì</span>
            </div>
            <div className="ev-vip-feature-item">
              <LineIcon name="ticket" />
              <span>QR Check-in không chạm</span>
            </div>
            <div className="ev-vip-feature-item">
              <LineIcon name="shield" />
              <span>Chống đầu cơ &amp; Hàng chờ thông minh</span>
            </div>
          </div>

          <div className="ev-vip-actions">
            <Link to="/explore" className="ev-vip-btn-primary">
              <span>Khám phá sự kiện ngay</span>
              <LineIcon name="arrow-right" />
            </Link>
            <Link to="/my-tickets" className="ev-vip-btn-secondary">
              <LineIcon name="ticket" />
              <span>Vé đã mua của tôi</span>
            </Link>
          </div>
        </div>

        {/* Phần Phải: Thẻ vé VIP Pass 3D Hologram sống động */}
        <div className="ev-vip-ticket-3d">
          <div className="ev-ticket-top-bar">
            <div className="ev-ticket-brand-chip">
              <LineIcon name="ticket" />
              <span>EVENTHUB PASS</span>
            </div>
            <span className="ev-ticket-chip-hologram">VIP ALL-ACCESS</span>
          </div>

          <div className="ev-ticket-event-details">
            <small>ĐÊM NHẠC ĐẶC BIỆT</small>
            <h4>EventHub Live Symphony &amp; Acoustic Fest 2026</h4>
            
            <div className="ev-ticket-meta-grid">
              <div className="ev-ticket-meta-cell">
                <span>Vị trí</span>
                <strong>KHU VIP · HÀNG A-12</strong>
              </div>
              <div className="ev-ticket-meta-cell">
                <span>Cổng vào</span>
                <strong>GATE 01 (FAST PASS)</strong>
              </div>
              <div className="ev-ticket-meta-cell">
                <span>Thời gian</span>
                <strong>20:00 · THỨ BẢY</strong>
              </div>
              <div className="ev-ticket-meta-cell">
                <span>Địa điểm</span>
                <strong>SECC · TP.HCM</strong>
              </div>
            </div>
          </div>

          {/* Rãnh khuyết vé & rãnh răng cưa cắt cuống vé */}
          <div className="ev-ticket-divider">
            <div className="ev-ticket-notch-left" />
            <div className="ev-ticket-dash-line" />
            <div className="ev-ticket-notch-right" />
          </div>

          {/* Cuống vé: Mã QR và Barcode */}
          <div className="ev-ticket-bottom-bar">
            <div className="ev-ticket-qr-box">
              {/* QR Code SVG Vector sắc nét */}
              <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="68" height="68" fill="white" />
                {/* Góc trên trái */}
                <rect x="6" y="6" width="20" height="20" rx="3" fill="#1e1b4b" />
                <rect x="10" y="10" width="12" height="12" rx="1" fill="white" />
                <rect x="13" y="13" width="6" height="6" fill="#6366f1" />
                {/* Góc trên phải */}
                <rect x="42" y="6" width="20" height="20" rx="3" fill="#1e1b4b" />
                <rect x="46" y="10" width="12" height="12" rx="1" fill="white" />
                <rect x="49" y="13" width="6" height="6" fill="#6366f1" />
                {/* Góc dưới trái */}
                <rect x="6" y="42" width="20" height="20" rx="3" fill="#1e1b4b" />
                <rect x="10" y="46" width="12" height="12" rx="1" fill="white" />
                <rect x="13" y="49" width="6" height="6" fill="#6366f1" />
                {/* Data blocks */}
                <rect x="30" y="8" width="8" height="4" fill="#312e81" />
                <rect x="30" y="16" width="8" height="4" fill="#6366f1" />
                <rect x="8" y="30" width="4" height="8" fill="#312e81" />
                <rect x="16" y="30" width="4" height="8" fill="#6366f1" />
                <rect x="28" y="28" width="12" height="12" rx="2" fill="#8b5cf6" />
                <rect x="32" y="32" width="4" height="4" fill="white" />
                <rect x="44" y="30" width="6" height="6" fill="#1e1b4b" />
                <rect x="54" y="30" width="8" height="4" fill="#6366f1" />
                <rect x="30" y="44" width="8" height="6" fill="#312e81" />
                <rect x="42" y="44" width="6" height="8" fill="#6366f1" />
                <rect x="52" y="44" width="10" height="10" rx="1" fill="#1e1b4b" />
                <rect x="30" y="54" width="6" height="8" fill="#8b5cf6" />
                <rect x="40" y="56" width="8" height="6" fill="#312e81" />
              </svg>
            </div>

            <div className="ev-ticket-barcode-box">
              <div className="ev-barcode-lines">
                <span style={{ width: 2 }} />
                <span style={{ width: 4 }} />
                <span style={{ width: 1 }} />
                <span style={{ width: 3 }} />
                <span style={{ width: 1 }} />
                <span style={{ width: 5 }} />
                <span style={{ width: 2 }} />
                <span style={{ width: 1 }} />
                <span style={{ width: 4 }} />
                <span style={{ width: 2 }} />
                <span style={{ width: 3 }} />
                <span style={{ width: 1 }} />
                <span style={{ width: 4 }} />
                <span style={{ width: 2 }} />
                <span style={{ width: 1 }} />
                <span style={{ width: 3 }} />
              </div>
              <span className="ev-barcode-num">EH-9824-7710-VIP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
