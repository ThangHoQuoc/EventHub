package com.eventhub.eventhub_backend.payment.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/confirm")
    public ApiResponse<PaymentResponse> confirmPayment(@Valid @RequestBody ConfirmPaymentRequest request) {
        PaymentResponse response = paymentService.confirmPayment(request);

        return ApiResponse.<PaymentResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Payment confirmed successfully")
                .result(response)
                .build();
    }
}
