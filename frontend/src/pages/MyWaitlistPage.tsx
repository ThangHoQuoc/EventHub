import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { PageNav } from "../components/ui/PageNav";
import { RequestState } from "../components/ui/RequestState";
import { EmptyState } from "../components/ui/EmptyState";
import { LineIcon } from "../components/ui/LineIcon";
import {
  acceptOfferApi,
  getMyOffersApi,
  getMyWaitlistApi,
  skipOfferApi,
  type WaitlistOfferDto,
} from "../api/waitlist";
import { useApiResource } from "../hooks/useApiResource";
import { canActOnOffer, entryStatusLabel, offerStatusLabel } from "../utils/waitlistState";
import { formatDateTime } from "../utils/format";

export function MyWaitlistPage() {
  const navigate = useNavigate();
  const [offerPage, setOfferPage] = useState(0);
  const [entryPage, setEntryPage] = useState(0);
  const offers = useApiResource(
    () => getMyOffersApi({ page: offerPage, size: 10, sort: "createdAt,desc" }),
    [offerPage]
  );
  const entries = useApiResource(
    () => getMyWaitlistApi({ page: entryPage, size: 10, sort: "createdAt,desc" }),
    [entryPage]
  );
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState("");
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function act(offer: WaitlistOfferDto, action: "accept" | "skip") {
    if (lock.current || !canActOnOffer(offer)) return;
    if (action === "skip" && !window.confirm("Bỏ qua lời mời mua vé này và nhường suất cho người tiếp theo?")) {
      return;
    }
    lock.current = true;
    setBusy(offer.id);
    setError("");
    setMessage("");
    try {
      const updated = await (action === "accept"
        ? acceptOfferApi(offer.id)
        : skipOfferApi(offer.id));
      offers.reload();
      entries.reload();
      if (action === "accept") {
        if (!updated.bookingId) {
          throw new Error(
            "Server chưa trả về mã đơn. Hãy tải lại lời mời và kiểm tra Đơn hàng trước khi thao tác tiếp."
          );
        }
        navigate(`/payment?bookingId=${encodeURIComponent(updated.bookingId)}`);
      } else {
        setMessage("Đã bỏ qua lời mời mua vé thành công.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý lời mời.");
      offers.reload();
      entries.reload();
    } finally {
      lock.current = false;
      setBusy("");
    }
  }

  function renderCountdown(expiresAt: string) {
    const diff = Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  const activeOffersCount = offers.data?.content.filter((o) => canActOnOffer(o, now)).length ?? 0;

  return (
    <CustomerLayout
      activeNav="waitlist"
      description="Hệ thống xếp hàng tự động thông minh, trao cơ hội mua vé chính hãng khi sự kiện có người nhượng lại suất."
      title="Hàng chờ thông minh & Lời mời mua vé"
    >
      <div className="eh-waitlist-page">
        {/* Banner Explainer */}
        <section aria-label="Cơ chế Smart Waitlist" className="eh-waitlist-explainer">
          <div className="eh-explainer-content">
            <h3>
              <LineIcon name="sparkles" />
              Cơ chế EventHub Smart Waitlist hoạt động như thế nào?
            </h3>
            <p>
              Khi một sự kiện cháy vé, hệ thống sẽ mở hàng chờ công bằng dựa trên thứ tự đăng ký và định danh tài khoản,
              loại bỏ hoàn toàn bot đầu cơ vé chợ đen.
            </p>
            <div className="eh-explainer-steps">
              <div className="eh-explainer-step">
                <span className="eh-step-num">1</span>
                <span>Xếp hàng tự động</span>
              </div>
              <div className="eh-explainer-step">
                <span className="eh-step-num">2</span>
                <span>Nhận lời mời độc quyền</span>
              </div>
              <div className="eh-explainer-step">
                <span className="eh-step-num">3</span>
                <span>Xác nhận & Giữ chỗ tức thì</span>
              </div>
            </div>
          </div>
        </section>

        <RequestState error={error} />
        {message && (
          <div
            role="status"
            style={{
              padding: "14px 18px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#059669",
              borderRadius: "var(--radius-lg)",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <LineIcon name="check" /> {message}
          </div>
        )}

        {/* Khối 1: Lời mời mua vé độc quyền (Offers) */}
        <section className="eh-waitlist-section">
          <div className="eh-section-header">
            <h2>
              <LineIcon name="ticket" />
              Lời mời mua vé độc quyền
              {activeOffersCount > 0 && (
                <span
                  style={{
                    background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    color: "#ffffff",
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    marginLeft: "8px",
                  }}
                >
                  {activeOffersCount} mới
                </span>
              )}
            </h2>
            <button
              className="btn btn-secondary"
              disabled={offers.loading || !!busy}
              onClick={offers.reload}
              style={{ fontSize: "12px", padding: "0 14px", minHeight: "36px" }}
              type="button"
            >
              <LineIcon name="refresh" /> Làm mới lời mời
            </button>
          </div>

          <RequestState error={offers.error} loading={offers.loading} onRetry={offers.reload} />

          {offers.data && offers.data.content.length > 0 ? (
            <div className="eh-offers-grid">
              {offers.data.content.map((offer) => {
                const canAct = canActOnOffer(offer, now);
                const isConverted = offer.status === "CONVERTED_TO_BOOKING";
                const isExpired = offer.status === "EXPIRED" || (offer.status === "CREATED" && !canAct);

                return (
                  <article
                    className={`eh-offer-golden-card ${isExpired ? "is-expired-card" : ""}`}
                    key={offer.id}
                  >
                    <div>
                      <div className="eh-offer-meta-group">
                        <span className="eh-golden-badge">
                          <LineIcon name="sparkles" />
                          {offerStatusLabel(offer.status)}
                        </span>

                        {canAct && (
                          <span className="eh-offer-countdown">
                            <LineIcon name="clock" />
                            Thời hạn xác nhận còn: <strong>{renderCountdown(offer.expiresAt)}</strong>
                          </span>
                        )}

                        <span style={{ fontSize: "12px", color: "var(--eh-text-muted)" }}>
                          Hết hạn lúc: {formatDateTime(offer.expiresAt)}
                        </span>
                      </div>

                      <h3 className="eh-offer-title">{offer.eventTitle}</h3>

                      <div className="eh-offer-details">
                        <span>
                          Suất vé: <strong>{offer.ticketTypeName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Số lượng: <strong>{offer.quantity} vé</strong>
                        </span>
                        <span>•</span>
                        <Link
                          style={{ color: "var(--eh-brand)", fontWeight: "700", textDecoration: "underline" }}
                          to={`/events/${offer.eventId}`}
                        >
                          Xem thông tin sự kiện
                        </Link>
                      </div>
                    </div>

                    <div className="eh-offer-actions">
                      {canAct && (
                        <>
                          <button
                            className="eh-btn-claim-offer"
                            disabled={!!busy}
                            onClick={() => act(offer, "accept")}
                            type="button"
                          >
                            <LineIcon name="card" />
                            {busy === offer.id ? "Đang giữ chỗ..." : "Chấp nhận & Tạo đơn"}
                          </button>
                          <button
                            className="eh-btn-skip-offer"
                            disabled={!!busy}
                            onClick={() => act(offer, "skip")}
                            type="button"
                          >
                            Bỏ qua suất này
                          </button>
                        </>
                      )}

                      {isConverted && offer.bookingId && (
                        <Link
                          className="btn btn-primary"
                          style={{ fontSize: "13px", padding: "0 18px", textAlign: "center" }}
                          to={`/payment?bookingId=${offer.bookingId}`}
                        >
                          <LineIcon name="card" /> Mở đơn hàng đã tạo
                        </Link>
                      )}

                      {offer.status === "CREATED" && !canAct && (
                        <p style={{ margin: 0, fontSize: "12px", color: "#dc2626", fontWeight: "700" }}>
                          Lời mời đã hết thời hạn xác nhận. Làm mới để cập nhật trạng thái.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            offers.data && (
              <EmptyState
                actionLabel="Xem các sự kiện hot"
                actionTo="/explore"
                description="Khi có người hủy vé hoặc ban tổ chức mở thêm kho vé, lời mời mua vé độc quyền sẽ xuất hiện ngay tại đây kèm thời gian giữ chỗ ưu tiên."
                title="Chưa có lời mời mua vé nào"
              />
            )
          )}

          <PageNav
            disabled={offers.loading || !!busy}
            onChange={setOfferPage}
            page={offerPage}
            totalPages={offers.data?.totalPages ?? 0}
          />
        </section>

        {/* Khối 2: Đăng ký hàng chờ (Entries) */}
        <section className="eh-waitlist-section" style={{ borderTop: "1px solid var(--eh-border)", paddingTop: "28px" }}>
          <div className="eh-section-header">
            <h2>
              <LineIcon name="clock" />
              Hàng chờ bạn đang tham gia
            </h2>
            <button
              className="btn btn-secondary"
              disabled={entries.loading || !!busy}
              onClick={entries.reload}
              style={{ fontSize: "12px", padding: "0 14px", minHeight: "36px" }}
              type="button"
            >
              <LineIcon name="refresh" /> Làm mới hàng chờ
            </button>
          </div>

          <RequestState error={entries.error} loading={entries.loading} onRetry={entries.reload} />

          {entries.data && entries.data.content.length > 0 ? (
            <div className="eh-queue-grid">
              {entries.data.content.map((entry) => {
                const isWaiting = entry.status === "WAITING";
                const isOffered = entry.status === "OFFERED";

                return (
                  <article className="eh-queue-card" key={entry.id}>
                    <div className="eh-queue-top">
                      <div>
                        <h4 className="eh-queue-title">{entry.eventTitle}</h4>
                        <p className="eh-queue-sub">
                          Hạng vé: <strong>{entry.ticketTypeName}</strong> (SL: {entry.quantity})
                        </p>
                      </div>

                      <span
                        className={`eh-status-pill ${
                          isWaiting
                            ? "is-pending"
                            : isOffered
                            ? "is-confirmed"
                            : "is-cancelled"
                        }`}
                        style={{ fontSize: "11px", padding: "3px 10px" }}
                      >
                        {entryStatusLabel(entry.status)}
                      </span>
                    </div>

                    <div className="eh-queue-bottom">
                      <span>Đăng ký: {formatDateTime(entry.createdAt)}</span>
                      <Link
                        style={{ color: "var(--eh-brand)", fontWeight: "700" }}
                        to={`/events/${entry.eventId}`}
                      >
                        Xem sự kiện →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            entries.data && (
              <EmptyState
                actionLabel="Khám phá sự kiện"
                actionTo="/explore"
                description="Bạn chưa đăng ký hàng chờ nào. Khi một sự kiện cháy vé, hãy chọn nút Đăng ký hàng chờ để hệ thống tự động giữ chỗ ưu tiên cho bạn."
                title="Chưa có lượt đăng ký hàng chờ nào"
              />
            )
          )}

          <PageNav
            disabled={entries.loading || !!busy}
            onChange={setEntryPage}
            page={entryPage}
            totalPages={entries.data?.totalPages ?? 0}
          />
        </section>
      </div>
    </CustomerLayout>
  );
}
