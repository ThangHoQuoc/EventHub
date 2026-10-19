import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockWaitlistOffers, mockWaitlistEntries } from "../data/mockCustomer";
import { formatCurrency, formatDate } from "../utils/format";
import type { WaitlistOfferItem, WaitlistEntryItem } from "../types/customer";

export function MyWaitlistPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<WaitlistOfferItem[]>(mockWaitlistOffers);
  const [entries, setEntries] = useState<WaitlistEntryItem[]>(mockWaitlistEntries);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function handleAcceptOffer(offer: WaitlistOfferItem) {
    setActionMessage(`Đang chuyển hướng đến thanh toán cho sự kiện: ${offer.event.title}`);
    setTimeout(() => {
      navigate(`/checkout?eventId=${offer.event.id}&fromWaitlist=true`);
    }, 700);
  }

  function handleSkipOffer(offerId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ qua suất vé này? Suất vé sẽ được nhường cho người tiếp theo.")) return;
    setOffers((prev) => prev.filter((o) => o.offerId !== offerId));
    setActionMessage("Đã bỏ qua suất ưu đãi. Cảm ơn bạn.");
    setTimeout(() => setActionMessage(null), 3000);
  }

  function handleLeaveWaitlist(entryId: string) {
    if (!window.confirm("Bạn muốn rời khỏi danh sách chờ của sự kiện này?")) return;
    setEntries((prev) => prev.filter((e) => e.entryId !== entryId));
  }

  return (
    <CustomerLayout
      activeNav="waitlist"
      description="Theo dõi vị trí trong hàng chờ và nhận quyền mua vé khi có người hủy hoặc trả vé."
      title="Smart Waitlist & Ưu đãi vé"
    >
      {actionMessage && (
        <div className="ev-customer-banner is-success">
          <LineIcon name="check" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Offers Section */}
      <section className="ev-waitlist-section-block">
        <div className="ev-waitlist-head">
          <span className="ev-eyebrow">
            <LineIcon name="sparkles" />
            Có cơ hội mới
          </span>
          <h2>Suất vé ưu đãi dành riêng cho bạn</h2>
          <p>Ban tổ chức đã mở thêm vé hoặc có người hủy chỗ. Bạn có thời gian giới hạn để xác nhận mua.</p>
        </div>

        {offers.length > 0 ? (
          <div className="ev-offers-list">
            {offers.map((offer) => (
              <article className="ev-offer-card" key={offer.offerId}>
                <div className="ev-offer-topline">
                  <span className="ev-offer-badge">Ưu đãi độc quyền</span>
                  <span className="ev-offer-timer">
                    <LineIcon name="clock" />
                    Hết hạn lúc: 21:30 hôm nay
                  </span>
                </div>

                <div className="ev-offer-content">
                  <div>
                    <h3>{offer.event.title}</h3>
                    <p>
                      <LineIcon name="map-pin" />
                      {offer.event.location}, {offer.event.city} ·{" "}
                      <strong>{formatDate(offer.event.startAt)}</strong>
                    </p>
                    <div className="ev-offer-details">
                      <span>Hạng vé: <strong>{offer.ticketTypeName}</strong></span>
                      <span>Số lượng: <strong>{offer.quantity} vé</strong></span>
                      <span>Đơn giá: <strong>{formatCurrency(offer.price)}</strong></span>
                    </div>
                  </div>

                  <div className="ev-offer-actions">
                    <button
                      className="ev-offer-btn-accept"
                      onClick={() => handleAcceptOffer(offer)}
                      type="button"
                    >
                      <LineIcon name="check" />
                      Chấp nhận mua ngay
                    </button>
                    <button
                      className="ev-offer-btn-skip"
                      onClick={() => handleSkipOffer(offer.offerId)}
                      type="button"
                    >
                      Nhường cho người khác
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ev-empty-offer-box">
            <LineIcon name="info" />
            <span>Hiện chưa có suất vé nhượng lại nào mới. Chúng tôi sẽ báo ngay khi đến lượt bạn.</span>
          </div>
        )}
      </section>

      {/* Entries Section */}
      <section className="ev-waitlist-section-block" style={{ marginTop: "42px" }}>
        <div className="ev-waitlist-head">
          <span className="ev-eyebrow">Hàng chờ của bạn</span>
          <h2>Sự kiện đang chờ xếp hàng</h2>
        </div>

        {entries.length > 0 ? (
          <div className="ev-entries-grid">
            {entries.map((entry) => (
              <div className="ev-entry-card" key={entry.entryId}>
                <div className="ev-entry-pos-badge">
                  <span>Vị trí của bạn</span>
                  <strong>#{entry.queuePosition}</strong>
                </div>
                <div className="ev-entry-body">
                  <h4>{entry.event.title}</h4>
                  <p>{entry.ticketTypeName} · {entry.quantity} vé</p>
                  <small>Đăng ký lúc: {formatDate(entry.createdAt)}</small>
                </div>
                <button
                  className="ev-entry-cancel-btn"
                  onClick={() => handleLeaveWaitlist(entry.entryId)}
                  title="Rời khỏi danh sách chờ"
                  type="button"
                >
                  <LineIcon name="trash" />
                  Rời hàng chờ
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="ev-empty-offer-box">
            <span>Bạn hiện không ở trong hàng chờ nào. Hãy tiếp tục khám phá các sự kiện hấp dẫn!</span>
            <Link className="ev-text-link" to="/explore">
              Khám phá sự kiện ngay <LineIcon name="arrow-right" />
            </Link>
          </div>
        )}
      </section>
    </CustomerLayout>
  );
}
