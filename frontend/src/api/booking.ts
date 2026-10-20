import { fetchApi } from "./client";
import type { PageResponse } from "./events";

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export interface BookingItemPayload {
  ticketTypeId: string;
  quantity: number;
}

export interface CreateBookingPayload {
  items: BookingItemPayload[];
}

export interface BookingItemDto {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface BookingDto {
  id: string;
  customerId: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  items: BookingItemDto[];
}

export async function createBookingApi(payload: CreateBookingPayload): Promise<BookingDto> {
  return fetchApi<BookingDto>("/api/v1/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyBookingsApi(params: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<BookingDto>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  const endpoint = `/api/v1/bookings${query ? `?${query}` : ""}`;

  return fetchApi<PageResponse<BookingDto>>(endpoint, {
    method: "GET",
  });
}

export async function getBookingDetailApi(bookingId: string): Promise<BookingDto> {
  return fetchApi<BookingDto>(`/api/v1/bookings/${bookingId}`, {
    method: "GET",
  });
}

export async function cancelBookingApi(bookingId: string): Promise<BookingDto> {
  return fetchApi<BookingDto>(`/api/v1/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });
}
