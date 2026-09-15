package com.eventhub.eventhub_backend.event.repository;

import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, String>, EventRepositoryCustom {

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByStatusAndEndAtBefore(EventStatus status, Instant time);
}
