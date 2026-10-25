package com.eventhub.eventhub_backend.event.repository;

import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, String>, EventRepositoryCustom {

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByStatusAndEndAtBefore(EventStatus status, Instant time);

    @Query("SELECT e FROM Event e WHERE (:organizerId IS NULL OR e.organizer.id = :organizerId) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Event> findByOrganizerAndFilters(@Param("organizerId") String organizerId,
                                          @Param("status") EventStatus status,
                                          @Param("keyword") String keyword,
                                          Pageable pageable);
}
