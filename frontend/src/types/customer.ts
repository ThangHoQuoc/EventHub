import type { Event } from "./event";

export type IssuedTicket = {
  id: string;
  ticketCode: string;
  event: Event;
  ticketTypeName: string;
  price: number;
  qrPayload: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  orderCode: string;
  purchasedAt: string;
  status: "VALID" | "USED" | "CANCELLED";
  checkInAt?: string;
  seatInfo?: string;
};

export type CustomerBooking = {
  id: string;
  bookingCode: string;
  event: Event;
  ticketTypeName: string;
  quantity: number;
  totalAmount: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  expiresAt?: string;
  ticketsCount: number;
};

export type WaitlistOfferItem = {
  offerId: string;
  entryId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  event: Event;
  quantity: number;
  price: number;
  status: "OFFERED" | "CONVERTED" | "SKIPPED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
};

export type WaitlistEntryItem = {
  entryId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  event: Event;
  quantity: number;
  queuePosition: number;
  status: "WAITING" | "OFFERED" | "CONVERTED" | "EXPIRED";
  createdAt: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN";
  city: string;
  joinDate: string;
  totalBookings: number;
};
