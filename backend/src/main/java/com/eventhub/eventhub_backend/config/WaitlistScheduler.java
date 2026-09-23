package com.eventhub.eventhub_backend.config;

import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class WaitlistScheduler {

    private final WaitlistOfferService waitlistOfferService;

    @Scheduled(fixedRate = 60000)
    public void expireCreatedWaitlistOffers() {
        waitlistOfferService.expireCreatedOffers(Instant.now());
    }
}
