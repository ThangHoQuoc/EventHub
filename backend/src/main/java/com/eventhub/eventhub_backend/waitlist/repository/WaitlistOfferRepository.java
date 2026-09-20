package com.eventhub.eventhub_backend.waitlist.repository;

import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaitlistOfferRepository extends JpaRepository<WaitlistOffer, String> {

    boolean existsByWaitlistEntryIdAndStatus(String waitlistEntryId, WaitlistOfferStatus status);

    Page<WaitlistOffer> findByWaitlistEntryCustomerId(String customerId, Pageable pageable);
}
