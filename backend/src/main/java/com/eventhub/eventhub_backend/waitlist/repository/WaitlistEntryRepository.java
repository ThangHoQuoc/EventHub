package com.eventhub.eventhub_backend.waitlist.repository;

import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.List;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, String> {

    boolean existsByCustomerIdAndTicketTypeIdAndStatusIn(
            String customerId,
            String ticketTypeId,
            Collection<WaitlistEntryStatus> statuses
    );

    Page<WaitlistEntry> findByCustomerId(String customerId, Pageable pageable);

    @Query("select e.ticketType.id from WaitlistEntry e where e.id = :id")
    Optional<String> findTicketTypeIdById(@Param("id") String id);

    @Query("select distinct e.ticketType.id from WaitlistEntry e where e.status = :status order by e.ticketType.id")
    List<String> findWaitingTicketTypeIds(@Param("status") WaitlistEntryStatus status);

    Optional<WaitlistEntry> findFirstByTicketTypeIdAndStatusAndQuantityLessThanEqualOrderByCreatedAtAscIdAsc(
            String ticketTypeId,
            WaitlistEntryStatus status,
            Integer quantity
    );
}
