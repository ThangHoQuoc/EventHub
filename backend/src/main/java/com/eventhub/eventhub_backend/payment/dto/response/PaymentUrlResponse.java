package com.eventhub.eventhub_backend.payment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentUrlResponse {

    String paymentUrl;
    String bookingId;
    String provider;
}
