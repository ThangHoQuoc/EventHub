import { fetchApi } from "./client";
import type { EventDto, TicketTypeDto, PageResponse } from "./events";
import type { TicketDto } from "./tickets";

export interface CreateEventPayload {
  title: string;
  description: string;
  thumbnailUrl?: string;
  category?: string;
  location: string;
  startAt: string;
  endAt: string;
}

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface CheckInPayload {
  ticketCode?: string;
  qrPayload?: string;
}

export async function createEventApi(payload: CreateEventPayload): Promise<EventDto> {
  return fetchApi<EventDto>("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function publishEventApi(eventId: string): Promise<EventDto> {
  return fetchApi<EventDto>(`/api/v1/events/${eventId}/publish`, {
    method: "POST",
  });
}

export async function cancelEventApi(eventId: string): Promise<EventDto> {
  return fetchApi<EventDto>(`/api/v1/events/${eventId}/cancel`, {
    method: "POST",
  });
}

export async function createTicketTypeApi(
  eventId: string,
  payload: CreateTicketTypePayload
): Promise<TicketTypeDto> {
  return fetchApi<TicketTypeDto>(`/api/v1/events/${eventId}/ticket-types`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkInTicketApi(payload: CheckInPayload): Promise<TicketDto> {
  return fetchApi<TicketDto>("/api/v1/tickets/check-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// API danh sách hiện chỉ tìm các sự kiện PUBLISHED, không phải danh sách bản nháp của organizer.
export function searchEventsApi(page = 0, keyword = "") {
  const params = new URLSearchParams({page:String(page),size:"10",sort:"createdAt,desc",keyword});
  return fetchApi<PageResponse<EventDto>>(`/api/v1/events?${params}`);
}
export function getEventApi(id: string) {
  return fetchApi<EventDto>(`/api/v1/events/${encodeURIComponent(id)}`);
}
export function updateEventApi(id: string, payload: Partial<CreateEventPayload>) {
  return fetchApi<EventDto>(`/api/v1/events/${encodeURIComponent(id)}`, {method:"PATCH",body:JSON.stringify(payload)});
}
export function updateTicketTypeApi(id: string, payload: Partial<CreateTicketTypePayload>) {
  return fetchApi<TicketTypeDto>(`/api/v1/events/ticket-types/${encodeURIComponent(id)}`, {method:"PATCH",body:JSON.stringify(payload)});
}
export function deleteTicketTypeApi(id: string) {
  return fetchApi<void>(`/api/v1/events/ticket-types/${encodeURIComponent(id)}`, {method:"DELETE"});
}
