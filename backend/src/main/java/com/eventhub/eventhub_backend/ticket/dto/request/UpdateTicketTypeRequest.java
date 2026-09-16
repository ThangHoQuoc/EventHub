package com.eventhub.eventhub_backend.ticket.dto.request;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTicketTypeRequest {

    @Size(min = 1, max = 100)
    String name;

    String description;

    @Positive
    BigDecimal price;

    @Positive
    Integer quantity;
}
