package com.eventhub.eventhub_backend.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConfirmPaymentRequest {

    @NotBlank(message = "Booking id is required")
    String bookingId;

    @NotBlank(message = "Payment provider is required")
    String provider;

    @NotBlank(message = "Provider transaction id is required")
    String providerTransactionId;
}
