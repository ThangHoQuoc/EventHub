package com.eventhub.eventhub_backend.config;

import com.eventhub.eventhub_backend.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventScheduler {

    private final EventService eventService;

    @Scheduled(fixedRate = 60000)
    public void completeExpiredEvents() {
        eventService.completeExpiredEvents();
    }
}