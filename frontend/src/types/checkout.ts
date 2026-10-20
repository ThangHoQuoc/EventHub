import type { Event } from "./event";

export type CheckoutTicket = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  lowStock?: number;
  soldOut?: boolean;
};

export type Recipient = {
  fullName: string;
  email: string;
  phone: string;
};

export type CheckoutOrder = {
  event: Event;
  tickets: CheckoutTicket[];
  recipient: Recipient;
  serviceFee: number;
  discount: number;
  promoCode?: string;
  orderCode: string;
};

export type PaymentMethod = "vnpay" | "momo" | "atm" | "card";
export type ResultStatus = "success" | "failed" | "processing";

