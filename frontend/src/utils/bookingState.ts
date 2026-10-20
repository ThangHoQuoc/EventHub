import type { BookingStatus } from "../api/booking";

export const bookingStatusLabel: (status: BookingStatus) => string = status => ({
  PENDING_PAYMENT: "Chờ xác nhận thanh toán", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", EXPIRED: "Hết hạn",
})[status] ?? "Chưa xác định";

export function paymentResultStatus(status?: string) {
  if (status === "CONFIRMED") return "success";
  if (status === "CANCELLED" || status === "EXPIRED") return "failed";
  return "processing";
}

export function readSelection(params: URLSearchParams) {
  const eventId = params.get("eventId");
  const ticketTypeId = params.get("ticketTypeId");
  const quantity = Number(params.get("quantity"));
  return eventId && ticketTypeId && Number.isSafeInteger(quantity) && quantity > 0 ? { eventId, ticketTypeId, quantity } : null;
}
