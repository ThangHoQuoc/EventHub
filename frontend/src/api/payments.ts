import { fetchApi } from "./client";

export interface ConfirmPaymentPayload {
  bookingId: string;
  provider: string;
  providerTransactionId: string;
}

export interface CreatePaymentUrlPayload {
  bookingId: string;
  bankCode?: string;
}

export interface PaymentUrlDto {
  paymentUrl: string;
  bookingId: string;
  provider: string;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  provider: string;
  providerTransactionId: string;
  paidAt: string;
  bookingStatus: string;
}

export async function confirmPaymentApi(payload: ConfirmPaymentPayload): Promise<PaymentDto> {
  return fetchApi<PaymentDto>("/api/v1/payments/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPaymentUrlApi(payload: CreatePaymentUrlPayload): Promise<PaymentUrlDto> {
  return fetchApi<PaymentUrlDto>("/api/v1/payments/create-url", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function vnpayCallbackApi(queryString: string): Promise<PaymentDto> {
  const cleanQuery = queryString.startsWith("?") ? queryString.substring(1) : queryString;
  return fetchApi<PaymentDto>(`/api/v1/payments/vnpay-callback?${cleanQuery}`, {
    method: "GET",
  });
}
