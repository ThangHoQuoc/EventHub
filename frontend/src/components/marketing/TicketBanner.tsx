import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";

export function TicketBanner() {
  return (
    <section className="ev-home-section ev-ticket-banner-section">
      <div className="ev-unified-ticket-banner">
        {/* Phần Trái: Headline tinh gọn & Hành động */}
        <div className="ev-ticket-banner-left">
          <span className="ev-banner-tag">EVENTHUB TICKET</span>
          <h2>Sự kiện tiếp theo đang chờ bạn.</h2>
          <p>
            Hàng trăm concert âm nhạc, lễ hội và workshop công nghệ đang diễn ra khắp cả nước.
            Đặt vé an toàn, nhận mã QR vào cổng tức thì.
          </p>

          <div className="ev-banner-btn-group">
            <Link to="/explore" className="ev-banner-primary-btn">
              <span>Khám phá ngay</span>
              <LineIcon name="arrow-right" />
            </Link>
            <Link to="/my-tickets" className="ev-banner-secondary-btn">
              <LineIcon name="ticket" />
              <span>Vé của tôi</span>
            </Link>
          </div>
        </div>

        {/* Phần Phải: Cuống vé điện tử nền trắng cao cấp, thanh lịch */}
        <div className="ev-ticket-banner-right">
          <div className="ev-clean-ticket-card">
            {/* Header của vé */}
            <div className="ev-clean-ticket-header">
              <div className="ev-ticket-badge-brand">
                <LineIcon name="ticket" />
                <span>EVENTHUB PASS</span>
              </div>
              <span className="ev-ticket-badge-vip">VIP</span>
            </div>

            {/* Thông tin sự kiện */}
            <div className="ev-clean-ticket-body">
              <small>SỰ KIỆN NỔI BẬT</small>
              <h4>Hòa Nhạc Giai Điệu Mùa Thu 2026</h4>
              <div className="ev-clean-ticket-meta">
                <div>
                  <span>Thời gian</span>
                  <strong>20:00 · Thứ Bảy</strong>
                </div>
                <div>
                  <span>Khu vực</span>
                  <strong>Hàng A · Ghế 12</strong>
                </div>
              </div>
            </div>

            {/* Rãnh khuyết xé cuống vé */}
            <div className="ev-clean-ticket-perforation">
              <span className="notch-l" />
              <div className="dashed-line" />
              <span className="notch-r" />
            </div>

            {/* Cuống vé có QR và Barcode */}
            <div className="ev-clean-ticket-stub">
              <div className="stub-qr">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="60" height="60" fill="white" />
                  <rect x="5" y="5" width="18" height="18" rx="2" fill="#1e1b4b" />
                  <rect x="9" y="9" width="10" height="10" fill="white" />
                  <rect x="12" y="12" width="4" height="4" fill="#6366f1" />
                  <rect x="37" y="5" width="18" height="18" rx="2" fill="#1e1b4b" />
                  <rect x="41" y="9" width="10" height="10" fill="white" />
                  <rect x="44" y="12" width="4" height="4" fill="#6366f1" />
                  <rect x="5" y="37" width="18" height="18" rx="2" fill="#1e1b4b" />
                  <rect x="9" y="41" width="10" height="10" fill="white" />
                  <rect x="12" y="44" width="4" height="4" fill="#6366f1" />
                  <rect x="27" y="8" width="6" height="4" fill="#4338ca" />
                  <rect x="27" y="16" width="6" height="4" fill="#6366f1" />
                  <rect x="8" y="27" width="4" height="6" fill="#4338ca" />
                  <rect x="16" y="27" width="4" height="6" fill="#6366f1" />
                  <rect x="26" y="26" width="9" height="9" rx="1" fill="#8b5cf6" />
                  <rect x="38" y="27" width="6" height="4" fill="#1e1b4b" />
                  <rect x="48" y="27" width="6" height="4" fill="#6366f1" />
                  <rect x="27" y="38" width="6" height="6" fill="#4338ca" />
                  <rect x="38" y="38" width="6" height="6" fill="#6366f1" />
                  <rect x="46" y="38" width="8" height="8" rx="1" fill="#1e1b4b" />
                  <rect x="27" y="48" width="6" height="6" fill="#8b5cf6" />
                </svg>
              </div>

              <div className="stub-barcode">
                <div className="barcode-bars">
                  <span style={{ width: 2 }} />
                  <span style={{ width: 4 }} />
                  <span style={{ width: 1 }} />
                  <span style={{ width: 3 }} />
                  <span style={{ width: 1 }} />
                  <span style={{ width: 4 }} />
                  <span style={{ width: 2 }} />
                  <span style={{ width: 3 }} />
                  <span style={{ width: 1 }} />
                  <span style={{ width: 4 }} />
                  <span style={{ width: 2 }} />
                  <span style={{ width: 3 }} />
                </div>
                <small>EH-8820-VIP</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
