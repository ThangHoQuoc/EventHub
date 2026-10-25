package com.eventhub.eventhub_backend.waitlist.repository;

import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface WaitlistOfferRepository extends JpaRepository<WaitlistOffer, String> {

    boolean existsByWaitlistEntryIdAndStatus(String waitlistEntryId, WaitlistOfferStatus status);

    Page<WaitlistOffer> findByWaitlistEntryCustomerId(String customerId, Pageable pageable);

    @Query("select o.ticketType.id from WaitlistOffer o where o.id = :id")
    Optional<String> findTicketTypeIdById(@Param("id") String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from WaitlistOffer o where o.id = :id")
    Optional<WaitlistOffer> findByIdForUpdate(@Param("id") String id);

    @Query("select coalesce(sum(o.quantity), 0) from WaitlistOffer o where o.ticketType.id = :typeId and o.status = :status")
    long sumQuantityByTicketTypeAndStatus(@Param("typeId") String typeId,
                                        @Param("status") WaitlistOfferStatus status);

    @Query("select distinct o.ticketType.id from WaitlistOffer o where o.status = :status and o.expiresAt <= :cutoff order by o.ticketType.id")
    List<String> findExpiredTicketTypeIds(@Param("status") WaitlistOfferStatus status,
                                         @Param("cutoff") Instant cutoff);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<WaitlistOffer> findByTicketTypeIdAndStatusAndExpiresAtLessThanEqualOrderByIdAsc(
            String ticketTypeId, WaitlistOfferStatus status, Instant expiresAt);
}
