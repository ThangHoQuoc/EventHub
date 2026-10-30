package com.eventhub.eventhub_backend.event.service;

import com.eventhub.eventhub_backend.admin.dto.response.EventStatsResponse;

public interface EventStatsService {

    EventStatsResponse getEventStats(String eventId);
}
