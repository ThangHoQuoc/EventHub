import type { TicketType } from "../types/ticket";

export const mockTicketTypes: TicketType[] = [
  {
    id: "standard",
    eventId: "ai-java-backend-bootcamp",
    name: "Standard",
    description: "Vé tham dự workshop và tài liệu sau buổi học.",
    price: 199000,
    quantity: 80,
    soldQuantity: 38,
    availableQuantity: 42,
    status: "AVAILABLE",
  },
  {
    id: "vip",
    eventId: "ai-java-backend-bootcamp",
    name: "VIP",
    description: "Ghế ưu tiên, Q&A riêng cùng mentor và tài liệu nâng cao.",
    price: 399000,
    quantity: 20,
    soldQuantity: 12,
    availableQuantity: 8,
    status: "LOW_STOCK",
  },
  {
    id: "student",
    eventId: "ai-java-backend-bootcamp",
    name: "Student",
    description: "Vé ưu đãi cho sinh viên, cần xác minh khi check-in.",
    price: 99000,
    quantity: 40,
    soldQuantity: 39,
    availableQuantity: 1,
    status: "LOW_STOCK",
  },
];
