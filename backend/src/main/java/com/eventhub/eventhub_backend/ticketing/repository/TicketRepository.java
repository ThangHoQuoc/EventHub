package com.eventhub.eventhub_backend.ticketing.repository;

import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, String> {

    List<Ticket> findByBookingId(String bookingId);

    Page<Ticket> findByCustomerId(String customerId, Pageable pageable);

    Optional<Ticket> findByTicketCode(String ticketCode);
}
