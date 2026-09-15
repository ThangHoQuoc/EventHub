package com.eventhub.eventhub_backend.event.repository;

import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventRepositoryCustom {


    Page<Event> searchEvents(EventSearchRequest request, Pageable pageable);
}
