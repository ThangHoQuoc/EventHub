package com.eventhub.eventhub_backend.waitlist.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.waitlist.dto.request.JoinWaitlistRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistEntryResponse;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1")
public class WaitlistController {

    private final WaitlistService waitlistService;
    private final WaitlistOfferService waitlistOfferService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/ticket-types/{ticketTypeId}/waitlist")
    public ApiResponse<WaitlistEntryResponse> joinWaitlist(@PathVariable String ticketTypeId, @Valid @RequestBody JoinWaitlistRequest request) {
        WaitlistEntryResponse response = waitlistService.joinWaitlist(ticketTypeId, request);

        return ApiResponse.<WaitlistEntryResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Joined waitlist successfully").result(response).build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/me/waitlist")
    public ApiResponse<PageResponse<WaitlistEntryResponse>> getMyWaitlist(Pageable pageable) {
        PageResponse<WaitlistEntryResponse> response = waitlistService.getMyWaitlist(pageable);

        return ApiResponse.<PageResponse<WaitlistEntryResponse>>builder().code(ErrorCode.SUCCESS.getCode()).message("Waitlist entries retrieved successfully").result(response).build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/me/waitlist-offers")
    public ApiResponse<PageResponse<WaitlistOfferResponse>> getMyWaitlistOffers(Pageable pageable) {
        PageResponse<WaitlistOfferResponse> response = waitlistOfferService.getMyOffers(pageable);

        return ApiResponse.<PageResponse<WaitlistOfferResponse>>builder().code(ErrorCode.SUCCESS.getCode()).message("Waitlist offers retrieved successfully").result(response).build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/waitlist-offers/{offerId}/accept")
    public ApiResponse<WaitlistOfferResponse> acceptWaitlistOffer(@PathVariable String offerId) {
        WaitlistOfferResponse response = waitlistOfferService.acceptOffer(offerId);

        return ApiResponse.<WaitlistOfferResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Waitlist offer accepted successfully").result(response).build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/waitlist-offers/{offerId}/skip")
    public ApiResponse<WaitlistOfferResponse> skipWaitlistOffer(@PathVariable String offerId) {
        WaitlistOfferResponse response = waitlistOfferService.skipOffer(offerId);

        return ApiResponse.<WaitlistOfferResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Waitlist offer skipped successfully").result(response).build();
    }
}
