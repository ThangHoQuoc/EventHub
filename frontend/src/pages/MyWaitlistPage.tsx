import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockWaitlistOffers, mockWaitlistEntries } from "../data/mockCustomer";
import { mockEvents } from "../data/mockEvents";
import { formatCurrency, formatDate } from "../utils/format";
import {
  acceptOfferApi,
  getMyOffersApi,
  getMyWaitlistApi,
  skipOfferApi,
  type WaitlistEntryDto,
  type WaitlistOfferDto,
} from "../api/waitlist";
import { useAuth } from "../context/AuthContext";
import type { WaitlistOfferItem, WaitlistEntryItem } from "../types/customer";

export function MyWaitlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState<WaitlistOfferItem[]>(mockWaitlistOffers);
  const [entries, setEntries] = useState<WaitlistEntryItem[]>(mockWaitlistEntries);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Lấy danh sách hàng chờ
    getMyWaitlistApi({ size: 20 })
      .then((res) => {
        if (res.content && res.content.length > 0) {
          const mappedEntries: WaitlistEntryItem[] = res.content.map((dto: WaitlistEntryDto, idx: number) => {
            const matchedEvent = mockEvents.find((e) => e.id === dto.eventId) || {
              ...mockEvents[0],
              id: dto.eventId || mockEvents[0].id,
              title: dto.eventTitle || mockEvents[0].title,
            };

            return {
              entryId: dto.id,
              ticketTypeId: dto.ticketTypeId,
              ticketTypeName: dto.ticketTypeName || "Hạng vé tiêu chuẩn",
              event: matchedEvent,
              quantity: dto.quantity || 1,
              queuePosition: idx + 1,
              status: dto.status === "WAITING" ? "WAITING" : dto.status === "OFFERED" ? "OFFERED" : "CONVERTED",
              createdAt: dto.createdAt,
            };
          });
          setEntries(mappedEntries);
        }
      })
      .catch(() => {
        // Fallback
      });

    // Lấy danh sách suất ưu đãi
    getMyOffersApi({ size: 20 })
      .then((res) => {
        if (res.content && res.content.length > 0) {
          const mappedOffers: WaitlistOfferItem[] = res.content.map((dto: WaitlistOfferDto) => {
            const matchedEvent = mockEvents.find((e) => e.id === dto.eventId) || {
              ...mockEvents[0],
              id: dto.eventId || mockEvents[0].id,
              title: dto.eventTitle || mockEvents[0].title,
            };

            return {
              offerId: dto.id,
              entryId: dto.waitlistEntryId,
              ticketTypeId: dto.ticketTypeId,
              ticketTypeName: dto.ticketTypeName || "Vé VIP Ưu đãi",
              event: matchedEvent,
              quantity: dto.quantity || 1,
              price: 350000,
              status: dto.status === "CREATED" ? "OFFERED" : dto.status === "ACCEPTED" ? "CONVERTED" : "SKIPPED",
              expiresAt: dto.expiresAt,
              createdAt: dto.createdAt,
            };
          });
          setOffers(mappedOffers);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, [user]);

  async function handleAcceptOffer(offer: WaitlistOfferItem) {
    setIsActing(true);
    setActionMessage(`Đang xác nhận chấp nhận suất vé cho: ${offer.event.title}...`);

    try {
      if (offer.offerId && !offer.offerId.startsWith("off-")) {
        const accepted = await acceptOfferApi(offer.offerId);
        if (accepted.bookingId) {
          navigate(`/payment?bookingId=${accepted.bookingId}&method=vnpay`);
          return;
        }
      }
      setTimeout(() => {
        navigate(`/checkout?eventId=${offer.event.id}&fromWaitlist=true`);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chấp nhận suất vé thất bại.";
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsActing(false);
    }
  }

  async function handleSkipOffer(offerId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ qua suất vé này? Suất vé sẽ được tự động nhường cho người tiếp theo trong hàng chờ.")) return;
    setIsActing(true);

    try {
      if (offerId && !offerId.startsWith("off-")) {
        await skipOfferApi(offerId);
      }
      setOffers((prev) => prev.filter((o) => o.offerId !== offerId));
      setActionMessage("Đã bỏ qua suất ưu đãi. Quyền mua đã được nhường cho người kế tiếp.");
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bỏ qua suất vé thất bại.";
      setActionMessage(msg);
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsActing(false);
    }
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
