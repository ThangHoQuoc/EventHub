package com.eventhub.eventhub_backend.waitlist.service;

import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import org.springframework.data.domain.Pageable;

public interface WaitlistOfferService {

    WaitlistOfferResponse createOffer(CreateWaitlistOfferRequest request);

    PageResponse<WaitlistOfferResponse> getMyOffers(Pageable pageable);
}
