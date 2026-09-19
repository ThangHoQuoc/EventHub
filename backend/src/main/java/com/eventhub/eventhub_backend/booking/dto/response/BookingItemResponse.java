package com.eventhub.eventhub_backend.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingItemResponse {

    String id;
    String ticketTypeId;
    String ticketTypeName;
    String eventId;
    String eventTitle;
    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal subtotal;
}
