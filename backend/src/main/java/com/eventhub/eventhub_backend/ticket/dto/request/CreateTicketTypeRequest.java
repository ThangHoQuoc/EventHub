package com.eventhub.eventhub_backend.ticket.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTicketTypeRequest {

    @NotBlank
    String name;

    String description;

    @NotNull
    @Positive
    BigDecimal price;

    @NotNull
    @Positive
    Integer quantity;

}
