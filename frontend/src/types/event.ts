export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketAvailability =
  | "AVAILABLE"
  | "LOW_STOCK"
  | "SOLD_OUT"
  | "WAITLIST_AVAILABLE";

export type Event = {
  id: string;
  title: string;
  description: string;
  city: "TP.HCM" | "Hà Nội" | "Đà Nẵng" | "Cần Thơ";
  location: string;
  startAt: string;
  endAt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  minPrice: number;
  status: EventStatus;
  ticketAvailability: TicketAvailability;
  matchScore?: number;
  matchReason?: string;
};

export type EventMatchPreferences = {
  topic?: string;
  city?: string;
  dateRange?: string;
  maxBudget?: number;
  audienceLevel?: "beginner" | "intermediate" | "advanced";
  goal?: string;
};
