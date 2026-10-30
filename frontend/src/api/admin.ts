import { fetchApi } from "./client";
import type { PageResponse } from "./events";

export type UserRole = "CUSTOMER" | "ORGANIZER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface UserAdminDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TopEventStatsDto {
  eventId: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
  revenue: number;
  soldTickets: number;
}

export interface AdminPlatformStatsDto {
  totalRevenue: number;
  totalTicketsSold: number;
  totalActiveEvents: number;
  totalUsers: number;
  topEvents: TopEventStatsDto[];
}

export interface TicketTypeStatsDto {
  ticketTypeId: string;
  name: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  availableQuantity: number;
  occupancyRate: number;
}

export interface EventStatsDto {
  eventId: string;
  title: string;
  status: string;
  totalRevenue: number;
  totalCapacity: number;
  totalSold: number;
  occupancyRate: number;
  checkedInTickets: number;
  waitingCount: number;
  ticketTypes: TicketTypeStatsDto[];
}

export async function getAdminUsersApi(params: {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
} = {}): Promise<PageResponse<UserAdminDto>> {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.role) searchParams.set("role", params.role);
  if (params.status) searchParams.set("status", params.status);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return fetchApi<PageResponse<UserAdminDto>>(`/api/v1/admin/users${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function updateUserStatusApi(userId: string, status: UserStatus): Promise<UserAdminDto> {
  return fetchApi<UserAdminDto>(`/api/v1/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminPlatformStatsApi(): Promise<AdminPlatformStatsDto> {
  return fetchApi<AdminPlatformStatsDto>("/api/v1/admin/stats", {
    method: "GET",
  });
}

export async function getEventStatsApi(eventId: string): Promise<EventStatsDto> {
  return fetchApi<EventStatsDto>(`/api/v1/events/${eventId}/stats`, {
    method: "GET",
  });
}
