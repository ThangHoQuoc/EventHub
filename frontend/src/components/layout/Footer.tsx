import { Link } from "react-router-dom";
import { EventHubBrand } from "../ui/EventHubBrand";

type FooterProps = {
  editorial?: boolean;
};

export function Footer({ editorial = false }: FooterProps) {
  if (editorial) {
    return (
      <footer className="editorial-footer">
        <div className="editorial-footer-grid">
          <div className="editorial-footer-brand">
            <EventHubBrand />
            <p>Khám phá đúng sự kiện, giữ đúng khoảnh khắc.</p>
          </div>
          <div><strong>Khám phá</strong><Link to="/explore">Sự kiện nổi bật</Link><Link to="/eventmatch">EventMatch</Link></div>
          <div><strong>Hỗ trợ</strong><a href="#help">Trung tâm trợ giúp</a><Link to="/my-tickets">Vé của tôi</Link></div>
          <div><strong>Nhà tổ chức</strong><Link to="/organizer/events/new">Tạo sự kiện</Link><Link to="/organizer">Quản lý vé</Link></div>
          <div><strong>Pháp lý</strong><a href="#terms">Điều khoản</a><a href="#privacy">Bảo mật</a></div>
        </div>
        <div className="editorial-footer-bottom"><span>© 2026 EventHub Việt Nam</span><span>Được tạo cho những cuộc gặp đáng nhớ.</span></div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div>
        <strong>EventHub</strong>
        <p>Tìm đúng sự kiện tại Việt Nam, đặt vé nhanh và check-in gọn.</p>
      </div>
      <div className="footer-meta">
        <span>EventMatch</span>
        <span>Smart Waitlist</span>
        <span>QR Ticket</span>
      </div>
    </footer>
  );
}
