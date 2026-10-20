import type { TicketType } from "../../types/ticket";
import { formatCurrency } from "../../utils/format";
import { Badge } from "../ui/Badge";

type TicketTypeCardProps = {
  ticketType: TicketType;
  selected: boolean;
  onSelect: () => void;
};

export function TicketTypeCard({ ticketType, selected, onSelect }: TicketTypeCardProps) {
  const isSoldOut = ticketType.status === "SOLD_OUT";

  return (
    <button
      className={selected ? "ticket-type ticket-type-selected" : "ticket-type"}
      disabled={isSoldOut}
      onClick={onSelect}
      type="button"
    >
      <span>
        <strong>{ticketType.name}</strong>
        <small>{ticketType.description}</small>
      </span>
      <span className="ticket-price">
        {formatCurrency(ticketType.price)}
        <Badge tone={ticketType.status === "LOW_STOCK" ? "warning" : isSoldOut ? "muted" : "success"}>
          {isSoldOut ? "Hết vé" : `Còn ${ticketType.availableQuantity}`}
        </Badge>
      </span>
    </button>
  );
}
