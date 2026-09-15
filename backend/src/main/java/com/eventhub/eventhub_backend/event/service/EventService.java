package com.eventhub.eventhub_backend.event.service;

import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EventService {

    EventResponse createEvent(CreateEventRequest request, String organizerId);

    PageResponse<EventResponse> getEvents(EventSearchRequest request, Pageable pageable);

    PageResponse<EventResponse> getPublishedEvents(Pageable pageable);

    EventResponse updateEvent(String eventId, UpdateEventRequest request);

    EventResponse getEvent(String eventId);

    EventResponse publishEvent(String eventId);

    EventResponse cancelEvent(String eventId);

    void completeExpiredEvents();


}
