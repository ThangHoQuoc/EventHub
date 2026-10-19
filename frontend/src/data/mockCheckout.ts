import type { CheckoutOrder } from "../types/checkout";
import { mockEvents } from "./mockEvents";

export const mockCheckoutOrder: CheckoutOrder = {
  event: mockEvents[1],
  recipient: {
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@email.com",
    phone: "0901 234 567",
  },
  tickets: [
    {
      id: "vip",
      name: "VIP",
      description: "Khu vực ưu tiên · Q&A riêng cùng diễn giả",
      price: 500000,
      quantity: 2,
      maxQuantity: 4,
      lowStock: 5,
    },
    {
      id: "standard",
      name: "Standard",
      description: "Tham dự toàn bộ chương trình · Tài liệu sau sự kiện",
      price: 250000,
      quantity: 1,
      maxQuantity: 6,
    },
  ],
  serviceFee: 50000,
  discount: 50000,
  promoCode: "EVENTHUB50",
  orderCode: "EH-240915-8F3K",
};

