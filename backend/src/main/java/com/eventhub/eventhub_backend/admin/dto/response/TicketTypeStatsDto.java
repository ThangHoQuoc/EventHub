package com.eventhub.eventhub_backend.admin.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeStatsDto {

    String ticketTypeId;
    String name;
    BigDecimal price;
    int quantity;
    int soldQuantity;
    int availableQuantity;
    double occupancyRate;
}
