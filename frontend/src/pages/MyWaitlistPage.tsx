import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { PageNav } from "../components/ui/PageNav";
import { RequestState } from "../components/ui/RequestState";
import { acceptOfferApi, getMyOffersApi, getMyWaitlistApi, skipOfferApi, type WaitlistOfferDto } from "../api/waitlist";
import { useApiResource } from "../hooks/useApiResource";
import { canActOnOffer, entryStatusLabel, offerStatusLabel } from "../utils/waitlistState";
import { formatDate } from "../utils/format";

export function MyWaitlistPage() {
  const navigate = useNavigate();
  const [offerPage, setOfferPage] = useState(0);
  const [entryPage, setEntryPage] = useState(0);
  const offers = useApiResource(() => getMyOffersApi({page:offerPage,size:10,sort:"createdAt,desc"}), [offerPage]);
  const entries = useApiResource(() => getMyWaitlistApi({page:entryPage,size:10,sort:"createdAt,desc"}), [entryPage]);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState("");
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  async function act(offer: WaitlistOfferDto, action: "accept" | "skip") {
    if (lock.current || !canActOnOffer(offer)) return;
    if (action === "skip" && !window.confirm("Bỏ qua lời mời mua vé này?")) return;
    lock.current = true; setBusy(offer.id); setError(""); setMessage("");
    try {
      const updated = await (action === "accept" ? acceptOfferApi(offer.id) : skipOfferApi(offer.id));
      offers.reload(); entries.reload();
      if (action === "accept") {
        if (!updated.bookingId) throw new Error("Server chưa trả về mã đơn. Hãy tải lại lời mời và kiểm tra Đơn hàng trước khi thao tác tiếp.");
        navigate(`/payment?bookingId=${encodeURIComponent(updated.bookingId)}`);
      } else setMessage("Đã bỏ qua lời mời theo kết quả từ hệ thống.");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể xử lý lời mời."); offers.reload(); entries.reload(); }
    finally { lock.current = false; setBusy(""); }
  }
  return <CustomerLayout activeNav="waitlist" title="Danh sách chờ & Lời mời mua vé" description="Theo dõi lời mời trên trang này. Lời mời chưa giữ chỗ; hệ thống kiểm tra số lượng khi bạn chấp nhận.">
    <RequestState error={error} />{message && <p role="status">{message}</p>}
    <section className="ev-waitlist-section-block"><div className="ev-waitlist-head"><h2>Lời mời mua vé</h2><button onClick={offers.reload} disabled={offers.loading || !!busy}>Làm mới lời mời</button></div>
      <RequestState loading={offers.loading} error={offers.error} onRetry={offers.reload} />
      <div className="ev-offers-list">{offers.data?.content.map(offer => <article className="ev-offer-card" key={offer.id}>
        <div className="ev-offer-topline"><span>{offerStatusLabel(offer.status)}</span><span>Hết hạn: {formatDate(offer.expiresAt)}</span></div>
        <div className="ev-offer-content"><div><h3>{offer.eventTitle}</h3><p>{offer.ticketTypeName} × {offer.quantity}</p><Link to={`/events/${offer.eventId}`}>Xem sự kiện và giá vé</Link></div><div className="ev-offer-actions">
          {canActOnOffer(offer, now) && <><button className="ev-offer-btn-accept" disabled={!!busy} onClick={() => act(offer,"accept")}>{busy === offer.id ? "Đang xử lý…" : "Chấp nhận và tạo đơn"}</button><button className="ev-offer-btn-skip" disabled={!!busy} onClick={() => act(offer,"skip")}>Bỏ qua</button></>}
          {offer.status === "CREATED" && !canActOnOffer(offer,now) && <p>Lời mời đã quá hạn. Làm mới để cập nhật trạng thái.</p>}
          {offer.bookingId && <Link to={`/payment?bookingId=${offer.bookingId}`}>Xem đơn đã tạo</Link>}
        </div></div></article>)}</div>
      {offers.data && !offers.data.content.length && <p role="status">Chưa có lời mời mua vé.</p>}
      <PageNav page={offerPage} totalPages={offers.data?.totalPages ?? 0} onChange={setOfferPage} disabled={offers.loading || !!busy} />
    </section>
    <section className="ev-waitlist-section-block"><div className="ev-waitlist-head"><h2>Đăng ký hàng chờ</h2><button onClick={entries.reload} disabled={entries.loading || !!busy}>Làm mới hàng chờ</button></div>
      <RequestState loading={entries.loading} error={entries.error} onRetry={entries.reload} />
      <div className="ev-entries-grid">{entries.data?.content.map(entry => <article className="ev-entry-card" key={entry.id}><div className="ev-entry-body"><h3>{entry.eventTitle}</h3><p>{entry.ticketTypeName} × {entry.quantity}</p><p>{entryStatusLabel(entry.status)}</p><small>Đăng ký: {formatDate(entry.createdAt)}</small></div></article>)}</div>
      {entries.data && !entries.data.content.length && <p role="status">Bạn chưa đăng ký hàng chờ nào.</p>}
      <PageNav page={entryPage} totalPages={entries.data?.totalPages ?? 0} onChange={setEntryPage} disabled={entries.loading || !!busy} />
    </section>
  </CustomerLayout>;
}
