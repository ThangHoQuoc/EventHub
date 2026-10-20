export type TicketType = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  availableQuantity: number;
  status: "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT";
};
