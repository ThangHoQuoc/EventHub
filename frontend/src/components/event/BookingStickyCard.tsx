import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Event } from "../../types/event";
import type { TicketType } from "../../types/ticket";
import { formatCurrency } from "../../utils/format";
import { Button } from "../ui/Button";
import { TicketTypeCard } from "./TicketTypeCard";
import { joinWaitlistApi } from "../../api/waitlist";
import { useAuth } from "../../context/AuthContext";

type BookingStickyCardProps = {
  event: Event;
  ticketTypes: TicketType[];
};

export function BookingStickyCard({ event, ticketTypes }: BookingStickyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstAvailable = ticketTypes.find((item) => item.status !== "SOLD_OUT") ?? ticketTypes[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  const selected = ticketTypes.find((item) => item.id === selectedId) ?? firstAvailable;
  const isSelectedSoldOut = selected?.status === "SOLD_OUT" || (selected?.availableQuantity ?? 0) <= 0;
  const total = useMemo(() => (selected?.price || 0) * quantity, [quantity, selected?.price]);
  const showWaitlist = event.ticketAvailability === "WAITLIST_AVAILABLE" || event.ticketAvailability === "SOLD_OUT" || isSelectedSoldOut;

  async function handleJoinWaitlist() {
    if (!user) {
      setWaitlistError("Vui lòng đăng nhập để nhận thông báo và ưu tiên giữ vé khi có suất mở lại.");
      window.setTimeout(() => navigate("/login"), 1500);
      return;
    }

    setIsJoiningWaitlist(true);
    setWaitlistError("");
    setWaitlistSuccess(false);

    try {
      if (selectedId && !selectedId.startsWith("mock-")) {
        await joinWaitlistApi(selectedId, quantity);
      }
      setWaitlistSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chưa thể tham gia danh sách chờ.";
      setWaitlistError(msg);
      // Fallback cho trải nghiệm demo
      setWaitlistSuccess(true);
    } finally {
      setIsJoiningWaitlist(false);
    }
  }

  return (
    <aside className="booking-card">
      <div>
        <span className="eyebrow">{showWaitlist ? "Hàng chờ thông minh" : "Đặt vé"}</span>
        <h2>{showWaitlist ? "Vé hiện đã hết chỗ" : "Chọn loại vé"}</h2>
        <p>{showWaitlist ? "Tham gia Smart Waitlist để được tự động nhượng quyền mua khi có người hủy vé." : "Giá vé rõ ràng, xác nhận nhanh."}</p>
      </div>

      <div className="ticket-list">
        {ticketTypes.map((ticketType) => (
          <TicketTypeCard
            key={ticketType.id}
            onSelect={() => setSelectedId(ticketType.id)}
            selected={ticketType.id === selectedId}
            ticketType={ticketType}
          />
        ))}
      </div>

      <label className="quantity-control">
        <span>Số lượng</span>
        <input
          min={1}
          max={showWaitlist ? 4 : Math.max(1, selected?.availableQuantity || 1)}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
          type="number"
          value={quantity}
        />
      </label>

      {waitlistSuccess ? (
        <div style={{ background: "var(--eh-green-50)", border: "1px solid var(--eh-green-100)", borderRadius: "var(--radius-md)", padding: 14, color: "var(--eh-green)" }}>
          <strong style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Đã tham gia hàng chờ thành công!</strong>
          <small style={{ display: "block", color: "var(--eh-text)", fontSize: 11, marginBottom: 8 }}>Hệ thống sẽ giữ vé và gửi ưu đãi ngay khi có người nhượng lại.</small>
          <Link to="/my-waitlist" style={{ fontSize: 12, fontWeight: 700, textDecoration: "underline" }}>Xem danh sách chờ của tôi →</Link>
        </div>
      ) : null}

      {waitlistError ? (
        <p style={{ color: "var(--eh-error)", fontSize: 12, margin: "4px 0" }}>{waitlistError}</p>
      ) : null}

      {!showWaitlist ? (
        <>
          <div className="total-row">
            <span>Tổng tiền</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <Button onClick={() => navigate("/checkout", { state: { eventId: event.id, ticketTypeId: selected?.id, quantity } })}>Đặt vé</Button>
        </>
      ) : (
        <Button disabled={isJoiningWaitlist || waitlistSuccess} onClick={handleJoinWaitlist}>
          {isJoiningWaitlist ? "Đang đăng ký..." : waitlistSuccess ? "Đã trong hàng đợi" : "Xếp hàng chờ vé này"}
        </Button>
      )}

      <button className="secondary-action" type="button">
        Thêm vào yêu thích
      </button>
    </aside>
  );
}
