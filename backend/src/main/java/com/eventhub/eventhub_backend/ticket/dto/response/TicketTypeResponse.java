package com.eventhub.eventhub_backend.ticket.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeResponse {
    String id;
    String eventId;
    String name;
    String description;
    BigDecimal price;
    Integer quantity;
    Integer soldQuantity;
    Integer availableQuantity;
}
