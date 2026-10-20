import { fetchApi } from "./client";

export interface EventDto {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category?: string;
  location: string;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TicketTypeDto {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  availableQuantity?: number;
}

export async function getPublicEvents(params: {
  page?: number;
  size?: number;
  sort?: string;
} = {}): Promise<PageResponse<EventDto>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  const endpoint = `/api/v1/events/public${queryString ? `?${queryString}` : ""}`;

  return fetchApi<PageResponse<EventDto>>(endpoint, {
    method: "GET",
  });
}

export async function getPublicEventById(eventId: string): Promise<EventDto> {
  return fetchApi<EventDto>(`/api/v1/events/public/${eventId}`, {
    method: "GET",
  });
}

export async function getEventTicketTypes(eventId: string): Promise<TicketTypeDto[]> {
  return fetchApi<TicketTypeDto[]>(`/api/v1/events/${eventId}/ticket-types`);
}

import type { Event } from "../types/event";

export function mapDtoToEvent(dto: EventDto, minPrice?: number): Event {
  let detectedCity: Event["city"] = "";
  const loc = dto.location || "";
  if (loc.includes("Hà Nội")) detectedCity = "Hà Nội";
  else if (loc.includes("Đà Nẵng")) detectedCity = "Đà Nẵng";
  else if (loc.includes("Cần Thơ")) detectedCity = "Cần Thơ";
  else if (loc.includes("TP.HCM") || loc.includes("Hồ Chí Minh")) detectedCity = "TP.HCM";

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || "",
    city: detectedCity,
    location: dto.location,
    startAt: dto.startAt,
    endAt: dto.endAt,
    imageUrl: dto.thumbnailUrl || "",
    category: dto.category || "Sự kiện",
    tags: [dto.category || "Sự kiện", detectedCity],
    minPrice: minPrice ?? 0,
    priceKnown: minPrice !== undefined,
    status: dto.status,
    ticketAvailability: "UNKNOWN",
  };
}
