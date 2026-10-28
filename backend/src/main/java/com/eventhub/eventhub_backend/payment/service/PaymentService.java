package com.eventhub.eventhub_backend.payment.service;

import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.request.CreatePaymentUrlRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentUrlResponse;

import java.util.Map;

public interface PaymentService {

    PaymentResponse confirmPayment(ConfirmPaymentRequest request);

    PaymentUrlResponse createPaymentUrl(CreatePaymentUrlRequest request, String ipAddress);

    PaymentResponse processVNPayCallback(Map<String, String> queryParams);

    Map<String, String> processVNPayIPN(Map<String, String> queryParams);
}
