package com.eventhub.eventhub_backend.payment.service;

import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse confirmPayment(ConfirmPaymentRequest request);
}
