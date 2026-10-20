import { fetchApi } from "./client";
import type { PageResponse } from "./events";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export interface TicketDto {
  id: string;
  ticketCode: string;
  qrPayload: string;
  status: TicketStatus;
  bookingId: string;
  customerId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  eventId: string;
  eventTitle: string;
  issuedAt: string;
  checkedInAt?: string;
}

export async function getMyTicketsApi(params: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<TicketDto>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  const endpoint = `/api/v1/tickets${query ? `?${query}` : ""}`;

  return fetchApi<PageResponse<TicketDto>>(endpoint, {
    method: "GET",
  });
}

export async function getTicketDetailApi(ticketId: string): Promise<TicketDto> {
  return fetchApi<TicketDto>(`/api/v1/tickets/${ticketId}`, {
    method: "GET",
  });
}
