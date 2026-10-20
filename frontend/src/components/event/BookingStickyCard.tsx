import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../types/event";
import type { TicketType } from "../../types/ticket";
import { formatCurrency } from "../../utils/format";
import { Button } from "../ui/Button";
import { TicketTypeCard } from "./TicketTypeCard";

type BookingStickyCardProps = {
  event: Event;
  ticketTypes: TicketType[];
};

export function BookingStickyCard({ event, ticketTypes }: BookingStickyCardProps) {
  const navigate = useNavigate();
  const firstAvailable = ticketTypes.find((item) => item.status !== "SOLD_OUT") ?? ticketTypes[0];
  const [selectedId, setSelectedId] = useState(firstAvailable.id);
  const [quantity, setQuantity] = useState(1);
  const selected = ticketTypes.find((item) => item.id === selectedId) ?? firstAvailable;
  const total = useMemo(() => selected.price * quantity, [quantity, selected.price]);
  const showWaitlist = event.ticketAvailability === "WAITLIST_AVAILABLE" || event.ticketAvailability === "SOLD_OUT";

  return (
    <aside className="booking-card">
      <div>
        <span className="eyebrow">Đặt vé</span>
        <h2>{showWaitlist ? "Vé hiện đã hết" : "Chọn loại vé"}</h2>
        <p>{showWaitlist ? "Tham gia danh sách chờ để được giữ vé khi có suất mở lại." : "Giá vé rõ ràng, xác nhận nhanh."}</p>
      </div>
      {!showWaitlist ? (
        <>
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
              max={Math.max(1, selected.availableQuantity)}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
          </label>
          <div className="total-row">
            <span>Tổng tiền</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <Button onClick={() => navigate("/checkout", { state: { eventId: event.id, ticketTypeId: selected.id, quantity } })}>Đặt vé</Button>
        </>
      ) : (
        <Button>Tham gia danh sách chờ</Button>
      )}
      <button className="secondary-action" type="button">
        Thêm vào yêu thích
      </button>
    </aside>
  );
}
