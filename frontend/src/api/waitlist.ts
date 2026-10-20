import { fetchApi } from "./client";
import type { PageResponse } from "./events";

export type WaitlistEntryStatus = "WAITING" | "OFFERED" | "CONVERTED" | "EXPIRED" | "SKIPPED" | "CANCELLED";
export type WaitlistOfferStatus = "CREATED" | "ACCEPTED" | "SKIPPED" | "EXPIRED" | "CONVERTED_TO_BOOKING";

export interface WaitlistEntryDto {
  id: string;
  customerId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  status: WaitlistEntryStatus;
  createdAt: string;
}

export interface WaitlistOfferDto {
  id: string;
  waitlistEntryId: string;
  customerId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  status: WaitlistOfferStatus;
  expiresAt: string;
  acceptedAt?: string;
  bookingId?: string;
  createdAt: string;
}

export async function joinWaitlistApi(
  ticketTypeId: string,
  quantity: number
): Promise<WaitlistEntryDto> {
  return fetchApi<WaitlistEntryDto>(`/api/v1/ticket-types/${ticketTypeId}/waitlist`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

export async function getMyWaitlistApi(params: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<WaitlistEntryDto>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  const endpoint = `/api/v1/me/waitlist${query ? `?${query}` : ""}`;

  return fetchApi<PageResponse<WaitlistEntryDto>>(endpoint, {
    method: "GET",
  });
}

export async function getMyOffersApi(params: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<WaitlistOfferDto>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  const endpoint = `/api/v1/me/waitlist-offers${query ? `?${query}` : ""}`;

  return fetchApi<PageResponse<WaitlistOfferDto>>(endpoint, {
    method: "GET",
  });
}

export async function acceptOfferApi(offerId: string): Promise<WaitlistOfferDto> {
  return fetchApi<WaitlistOfferDto>(`/api/v1/waitlist-offers/${offerId}/accept`, {
    method: "POST",
  });
}

export async function skipOfferApi(offerId: string): Promise<WaitlistOfferDto> {
  return fetchApi<WaitlistOfferDto>(`/api/v1/waitlist-offers/${offerId}/skip`, {
    method: "POST",
  });
}
