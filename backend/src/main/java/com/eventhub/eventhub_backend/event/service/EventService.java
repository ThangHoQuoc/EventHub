package com.eventhub.eventhub_backend.event.service;

import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import org.springframework.data.domain.Pageable;

public interface EventService {

    EventResponse createEvent(CreateEventRequest request, String organizerId);

    PageResponse<EventResponse> getEvents(EventSearchRequest request, Pageable pageable);

    PageResponse<EventResponse> getPublishedEvents(Pageable pageable);

    EventResponse getPublishedEvent(String eventId);

    EventResponse updateEvent(String eventId, UpdateEventRequest request);

    EventResponse getEvent(String eventId);

    EventResponse publishEvent(String eventId);

    EventResponse cancelEvent(String eventId);

    void completeExpiredEvents();

    PageResponse<EventResponse> getMyEvents(EventStatus status, String keyword, Pageable pageable);
}
