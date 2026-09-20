package com.eventhub.eventhub_backend.waitlist.service;

import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.Optional;

public interface WaitlistOfferService {

    WaitlistOfferResponse createOffer(CreateWaitlistOfferRequest request);

    PageResponse<WaitlistOfferResponse> getMyOffers(Pageable pageable);

    WaitlistOfferResponse acceptOffer(String offerId);

    WaitlistOfferResponse skipOffer(String offerId);

    int expireCreatedOffers(Instant now);

    Optional<WaitlistOfferResponse> offerNextEligibleEntry(String ticketTypeId, Instant expiresAt);
}
