import type { CheckoutTicket } from "../../types/checkout";
import { LineIcon } from "../ui/LineIcon";
import { MoneyText } from "./CheckoutUi";

type TicketLineItemProps = {
  ticket: CheckoutTicket;
  disabled?: boolean;
  onChange: (quantity: number) => void;
  onRemove: () => void;
};

export function TicketLineItem({ disabled, onChange, onRemove, ticket }: TicketLineItemProps) {
  return (
    <div className={`checkout-ticket-row ${ticket.soldOut ? "is-sold-out" : ""}`}>
      <div className="checkout-ticket-copy">
        <strong>{ticket.name}</strong>
        <span>{ticket.description}</span>
        {ticket.lowStock && !ticket.soldOut ? <small><i />Chỉ còn {ticket.lowStock} vé</small> : null}
        {ticket.soldOut ? <p role="alert">Hạng vé này vừa hết. <a href="/events/vietnam-tech-meetup-2026">Chọn lại vé</a></p> : null}
      </div>
      <MoneyText value={ticket.price} />
      <div className="quantity-stepper" aria-label={`Số lượng vé ${ticket.name}`}>
        <button aria-label={`Giảm vé ${ticket.name}`} disabled={disabled || ticket.soldOut || ticket.quantity <= 1} onClick={() => onChange(ticket.quantity - 1)} type="button"><LineIcon name="minus" /></button>
        <output aria-live="polite">{ticket.quantity}</output>
        <button aria-label={`Tăng vé ${ticket.name}`} disabled={disabled || ticket.soldOut || ticket.quantity >= ticket.maxQuantity} onClick={() => onChange(ticket.quantity + 1)} type="button"><LineIcon name="plus" /></button>
      </div>
      <MoneyText className="checkout-ticket-total" value={ticket.price * ticket.quantity} />
      <button aria-label={`Xóa vé ${ticket.name}`} className="checkout-ticket-remove" disabled={disabled} onClick={onRemove} type="button"><LineIcon name="trash" /><span>Xóa</span></button>
    </div>
  );
}

