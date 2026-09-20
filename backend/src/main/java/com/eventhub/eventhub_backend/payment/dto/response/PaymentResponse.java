package com.eventhub.eventhub_backend.payment.dto.response;

import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.payment.entity.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {

    String id;
    String bookingId;
    BigDecimal amount;
    PaymentStatus status;
    String provider;
    String providerTransactionId;
    Instant paidAt;
    BookingStatus bookingStatus;
}
