package com.eventhub.eventhub_backend.config;

import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaitlistScheduler {

    private final WaitlistOfferService waitlistOfferService;
    private final WaitlistEntryRepository waitlistEntryRepository;

    @Scheduled(fixedRate = 60000)
    public void expireCreatedWaitlistOffers() {
        waitlistOfferService.expireCreatedOffers(Instant.now());
        for (String typeId : waitlistEntryRepository.findWaitingTicketTypeIds(WaitlistEntryStatus.WAITING)) {
            try {
                waitlistOfferService.offerAvailableEntries(typeId);
            } catch (RuntimeException failure) {
                log.warn("Waitlist reconciliation failed for ticket type {}; will retry next run", typeId, failure);
            }
        }
    }
}
