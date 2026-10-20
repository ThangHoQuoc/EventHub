import { mockEvents } from "./mockEvents";
import { mockTicketTypes } from "./mockTicketTypes";
import type { OrganizerEvent, OrganizerStats, CheckInRecord } from "../types/organizer";
import type { TicketType } from "../types/ticket";

export const mockOrganizerStats: OrganizerStats = {
  totalEvents: 4,
  publishedEvents: 3,
  totalTicketsSold: 284,
  totalCapacity: 450,
  estimatedRevenue: 68500000,
};

export const mockOrganizerEvents: OrganizerEvent[] = [
  {
    ...mockEvents[0], // AI & Java Backend Bootcamp
    status: "PUBLISHED",
    soldTicketsCount: 89,
    totalTicketsCount: 140,
    revenue: 22610000,
    ticketTypes: mockTicketTypes,
  },
  {
    ...mockEvents[1], // Vietnam Tech Meetup 2026
    status: "PUBLISHED",
    soldTicketsCount: 120,
    totalTicketsCount: 150,
    revenue: 18000000,
    ticketTypes: [
      {
        id: "tt-vtm-01",
        eventId: "vietnam-tech-meetup-2026",
        name: "Vé Tiêu Chuẩn (Standard)",
        description: "Tham dự toàn bộ các phiên chia sẻ và networking.",
        price: 150000,
        quantity: 120,
        soldQuantity: 95,
        availableQuantity: 25,
        status: "AVAILABLE",
      },
      {
        id: "tt-vtm-02",
        eventId: "vietnam-tech-meetup-2026",
        name: "Vé VIP Founder Pass",
        description: "Tiệc tối giao lưu cùng các Founder & Nhà đầu tư.",
        price: 450000,
        quantity: 30,
        soldQuantity: 25,
        availableQuantity: 5,
        status: "LOW_STOCK",
      },
    ],
  },
  {
    ...mockEvents[2], // Đêm Nhạc Indie Sài Gòn
    status: "PUBLISHED",
    soldTicketsCount: 75,
    totalTicketsCount: 100,
    revenue: 27890000,
    ticketTypes: [
      {
        id: "tt-indie-01",
        eventId: "dem-nhac-indie-sai-gon",
        name: "Vé Đứng (Standing)",
        description: "Vé vào cửa khu vực khán đài đứng.",
        price: 250000,
        quantity: 70,
        soldQuantity: 50,
        availableQuantity: 20,
        status: "AVAILABLE",
      },
      {
        id: "tt-indie-02",
        eventId: "dem-nhac-indie-sai-gon",
        name: "Vé VIP Có Bàn (Seated Table)",
        description: "Bàn riêng 2 khách kèm đồ uống.",
        price: 350000,
        quantity: 30,
        soldQuantity: 25,
        availableQuantity: 5,
        status: "LOW_STOCK",
      },
    ],
  },
  {
    id: "org-draft-event-01",
    title: "Workshop Tối Ưu Hiệu Năng PostgreSQL Cho Developer",
    description: "Khóa đào tạo chuyên sâu về indexing, query plan và tuning database trong các dự án quy mô vừa và lớn.",
    city: "TP.HCM",
    location: "Hub Sài Gòn, Quận 3",
    startAt: "2026-11-05T09:00:00+07:00",
    endAt: "2026-11-05T17:00:00+07:00",
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    category: "Công nghệ",
    tags: ["PostgreSQL", "Database", "Backend", "Performance"],
    minPrice: 350000,
    status: "DRAFT",
    ticketAvailability: "AVAILABLE",
    soldTicketsCount: 0,
    totalTicketsCount: 60,
    revenue: 0,
    ticketTypes: [
      {
        id: "tt-pg-01",
        eventId: "org-draft-event-01",
        name: "Vé Early Bird",
        description: "Suất vé giảm giá đặc biệt khi đăng ký sớm.",
        price: 350000,
        quantity: 20,
        soldQuantity: 0,
        availableQuantity: 20,
        status: "AVAILABLE",
      },
      {
        id: "tt-pg-02",
        eventId: "org-draft-event-01",
        name: "Vé Tiêu Chuẩn (Standard)",
        description: "Vé đào tạo trọn gói một ngày.",
        price: 499000,
        quantity: 40,
        soldQuantity: 0,
        availableQuantity: 40,
        status: "AVAILABLE",
      },
    ],
  },
];

export const mockRecentCheckIns: CheckInRecord[] = [
  {
    id: "ck-01",
    ticketCode: "EH-TECH-98214",
    eventTitle: "Vietnam Tech Meetup 2026",
    holderName: "Nguyễn Minh Anh",
    ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
    checkedInAt: "18:42:10 · Hôm nay",
    status: "SUCCESS",
    staffName: "Trần Bảo An",
  },
  {
    id: "ck-02",
    ticketCode: "EH-TECH-88412",
    eventTitle: "Vietnam Tech Meetup 2026",
    holderName: "Lê Hoàng Long",
    ticketTypeName: "Vé VIP Founder Pass",
    checkedInAt: "18:40:05 · Hôm nay",
    status: "SUCCESS",
    staffName: "Trần Bảo An",
  },
  {
    id: "ck-03",
    ticketCode: "EH-TECH-98214",
    eventTitle: "Vietnam Tech Meetup 2026",
    holderName: "Nguyễn Minh Anh",
    ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
    checkedInAt: "18:44:18 · Hôm nay",
    status: "ALREADY_CHECKED_IN",
    staffName: "Trần Bảo An",
  },
];
