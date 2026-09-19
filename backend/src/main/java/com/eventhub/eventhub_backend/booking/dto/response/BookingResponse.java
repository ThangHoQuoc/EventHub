package com.eventhub.eventhub_backend.booking.dto.response;

import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {

    String id;
    String customerId;
    BookingStatus status;
    BigDecimal totalAmount;
    Instant createdAt;
    List<BookingItemResponse> items;
}
