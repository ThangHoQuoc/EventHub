package com.eventhub.eventhub_backend.payment.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.request.CreatePaymentUrlRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentUrlResponse;
import com.eventhub.eventhub_backend.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/payments")
public class PaymentController {

    PaymentService paymentService;

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

    @PostMapping("/create-url")
    public ApiResponse<PaymentUrlResponse> createPaymentUrl(
            @Valid @RequestBody CreatePaymentUrlRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = servletRequest.getRemoteAddr();
        }

        PaymentUrlResponse response = paymentService.createPaymentUrl(request, ipAddress);

        return ApiResponse.<PaymentUrlResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Payment URL generated successfully")
                .result(response)
                .build();
    }

    @GetMapping("/vnpay-callback")
    public ApiResponse<PaymentResponse> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        PaymentResponse response = paymentService.processVNPayCallback(queryParams);

        return ApiResponse.<PaymentResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Payment processed successfully")
                .result(response)
                .build();
    }

    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnpayIPN(@RequestParam Map<String, String> queryParams) {
        return paymentService.processVNPayIPN(queryParams);
    }
}
