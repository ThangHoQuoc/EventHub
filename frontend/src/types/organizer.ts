import type { Event, EventStatus } from "./event";
import type { TicketType } from "./ticket";

export type OrganizerStats = {
  totalEvents: number;
  publishedEvents: number;
  totalTicketsSold: number;
  totalCapacity: number;
  estimatedRevenue: number;
};

export type OrganizerEvent = Event & {
  soldTicketsCount: number;
  totalTicketsCount: number;
  revenue: number;
  ticketTypes: TicketType[];
};

export type CheckInRecord = {
  id: string;
  ticketCode: string;
  eventTitle: string;
  holderName: string;
  ticketTypeName: string;
  checkedInAt: string;
  status: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID";
  staffName: string;
};
