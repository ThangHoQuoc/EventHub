package com.eventhub.eventhub_backend.admin.dto.response;

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
public class AdminPlatformStatsResponse {

    BigDecimal totalRevenue;
    long totalTicketsSold;
    long totalActiveEvents;
    long totalUsers;
    List<TopEventStatsDto> topEvents;
}
