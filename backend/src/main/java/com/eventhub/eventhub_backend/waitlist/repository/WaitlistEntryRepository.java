package com.eventhub.eventhub_backend.waitlist.repository;

import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, String> {

    boolean existsByCustomerIdAndTicketTypeIdAndStatusIn(
            String customerId,
            String ticketTypeId,
            Collection<WaitlistEntryStatus> statuses
    );

    Page<WaitlistEntry> findByCustomerId(String customerId, Pageable pageable);
}
