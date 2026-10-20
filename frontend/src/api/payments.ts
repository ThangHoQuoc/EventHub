import { fetchApi } from "./client";
import type { BookingStatus } from "./booking";

export interface PaymentDto {
  id: string; bookingId: string; amount: number; status: string; provider: string;
  providerTransactionId: string; paidAt: string; bookingStatus: BookingStatus;
}
export function confirmPaymentApi(payload: { bookingId: string; provider: string; providerTransactionId: string }) {
  return fetchApi<PaymentDto>("/api/v1/payments/confirm", { method: "POST", body: JSON.stringify(payload) });
}
