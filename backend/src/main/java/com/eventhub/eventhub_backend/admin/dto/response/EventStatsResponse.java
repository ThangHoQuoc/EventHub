package com.eventhub.eventhub_backend.admin.dto.response;

import com.eventhub.eventhub_backend.event.entity.EventStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventStatsResponse {

    String eventId;
    String title;
    EventStatus status;
    BigDecimal totalRevenue;
    long totalCapacity;
    long totalSold;
    double occupancyRate;
    long checkedInTickets;
    long waitingCount;
    List<TicketTypeStatsDto> ticketTypes;
}
