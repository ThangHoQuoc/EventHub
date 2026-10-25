package com.eventhub.eventhub_backend.ticket.repository;

import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketTypeRepository extends JpaRepository<TicketType,String> {

    List<TicketType> findByEventId(String eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ticketType from TicketType ticketType where ticketType.id = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") String id);

    @Modifying(flushAutomatically = true)
    @Query("""
            update TicketType ticketType
            set ticketType.soldQuantity = COALESCE(ticketType.soldQuantity, 0) + :quantity
            where ticketType.id = :ticketTypeId
              and ticketType.quantity is not null
              and COALESCE(ticketType.soldQuantity, 0) + :quantity <= ticketType.quantity
            """)
    int reserveAvailableQuantity(@Param("ticketTypeId") String ticketTypeId, @Param("quantity") int quantity);
}
