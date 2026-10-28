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
public class CreatePaymentUrlRequest {

    @NotBlank(message = "Booking ID is required")
    String bookingId;

    String bankCode; // Tùy chọn: VNPAYQR, VNBANK, INTCARD
}
