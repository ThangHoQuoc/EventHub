import { mockEvents } from "./mockEvents";
import type {
  IssuedTicket,
  CustomerBooking,
  WaitlistOfferItem,
  WaitlistEntryItem,
  UserProfile,
} from "../types/customer";

export const mockUserProfile: UserProfile = {
  id: "usr-vietnam-2026",
  fullName: "Nguyễn Minh Anh",
  email: "minhanh.nguyen@email.com",
  phone: "0908 123 456",
  role: "CUSTOMER",
  city: "TP.HCM",
  joinDate: "15/01/2026",
  totalBookings: 4,
};

export const mockIssuedTickets: IssuedTicket[] = [
  {
    id: "tkt-01-saigon-tech",
    ticketCode: "EH-TECH-98214",
    event: mockEvents[1], // Vietnam Tech Meetup 2026
    ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
    price: 150000,
    qrPayload: "EVENTHUB:TKT:EH-TECH-98214:SIG:a8f9c1",
    holderName: "Nguyễn Minh Anh",
    holderEmail: "minhanh.nguyen@email.com",
    holderPhone: "0908 123 456",
    orderCode: "ORD-8F3K-9281",
    purchasedAt: "2026-10-10T14:30:00+07:00",
    status: "VALID",
    seatInfo: "Khu vực Khán đài A · Tự do",
  },
  {
    id: "tkt-02-indie-music",
    ticketCode: "EH-INDIE-47120",
    event: mockEvents[2], // Đêm Nhạc Indie Sài Gòn
    ticketTypeName: "Vé VIP Có Bàn",
    price: 350000,
    qrPayload: "EVENTHUB:TKT:EH-INDIE-47120:SIG:f4b2e8",
    holderName: "Nguyễn Minh Anh",
    holderEmail: "minhanh.nguyen@email.com",
    holderPhone: "0908 123 456",
    orderCode: "ORD-9412-1042",
    purchasedAt: "2026-10-08T09:15:00+07:00",
    status: "VALID",
    seatInfo: "Bàn B04 · 2 Khách",
  },
  {
    id: "tkt-03-java-backend",
    ticketCode: "EH-JAVA-11029",
    event: mockEvents[0], // AI & Java Backend Bootcamp
    ticketTypeName: "Vé Sinh Viên (Student)",
    price: 199000,
    qrPayload: "EVENTHUB:TKT:EH-JAVA-11029:SIG:9c3d12",
    holderName: "Nguyễn Minh Anh",
    holderEmail: "minhanh.nguyen@email.com",
    holderPhone: "0908 123 456",
    orderCode: "ORD-7193-8821",
    purchasedAt: "2026-10-02T16:00:00+07:00",
    status: "USED",
    checkInAt: "2026-10-12T08:45:00+07:00",
    seatInfo: "Phòng Hội Thảo 3",
  },
];

export const mockCustomerBookings: CustomerBooking[] = [
  {
    id: "bk-01",
    bookingCode: "EH-BK-2026-0812",
    event: mockEvents[1],
    ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
    quantity: 1,
    totalAmount: 165000,
    status: "CONFIRMED",
    createdAt: "2026-10-10T14:30:00+07:00",
    ticketsCount: 1,
  },
  {
    id: "bk-02",
    bookingCode: "EH-BK-2026-0749",
    event: mockEvents[2],
    ticketTypeName: "Vé VIP Có Bàn",
    quantity: 1,
    totalAmount: 365000,
    status: "CONFIRMED",
    createdAt: "2026-10-08T09:15:00+07:00",
    ticketsCount: 1,
  },
  {
    id: "bk-03",
    bookingCode: "EH-BK-2026-0610",
    event: mockEvents[4], // Startup Networking Night
    ticketTypeName: "Vé Khách Mời (Guest)",
    quantity: 2,
    totalAmount: 375000,
    status: "PENDING",
    createdAt: "2026-10-19T19:40:00+07:00",
    expiresAt: "2026-10-19T19:55:00+07:00",
    ticketsCount: 2,
  },
  {
    id: "bk-04",
    bookingCode: "EH-BK-2026-0422",
    event: mockEvents[0],
    ticketTypeName: "Vé Sinh Viên (Student)",
    quantity: 1,
    totalAmount: 214000,
    status: "CONFIRMED",
    createdAt: "2026-10-02T16:00:00+07:00",
    ticketsCount: 1,
  },
];

export const mockWaitlistOffers: WaitlistOfferItem[] = [
  {
    offerId: "off-01",
    entryId: "ent-01",
    ticketTypeId: "tt-ux-ui",
    ticketTypeName: "Vé Tham Dự Workshop (Standard)",
    event: mockEvents[3], // Workshop UX/UI cho người mới
    quantity: 1,
    price: 299000,
    status: "OFFERED",
    expiresAt: "2026-10-19T21:30:00+07:00",
    createdAt: "2026-10-19T19:30:00+07:00",
  },
];

export const mockWaitlistEntries: WaitlistEntryItem[] = [
  {
    entryId: "ent-02",
    ticketTypeId: "tt-exhibition",
    ticketTypeName: "Vé Vào Cổng Triển Lãm (Miễn phí)",
    event: mockEvents[5], // Triển lãm Sáng tạo Trẻ
    quantity: 2,
    queuePosition: 3,
    status: "WAITING",
    createdAt: "2026-10-15T10:20:00+07:00",
  },
];
