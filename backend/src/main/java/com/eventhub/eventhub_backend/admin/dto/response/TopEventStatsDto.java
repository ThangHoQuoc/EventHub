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
public class TopEventStatsDto {

    String eventId;
    String title;
    String category;
    String thumbnailUrl;
    BigDecimal revenue;
    long soldTickets;
}
