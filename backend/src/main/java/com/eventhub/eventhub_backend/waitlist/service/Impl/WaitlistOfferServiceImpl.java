package com.eventhub.eventhub_backend.waitlist.service.Impl;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistOfferRepository;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WaitlistOfferServiceImpl implements WaitlistOfferService {

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final WaitlistOfferRepository waitlistOfferRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public WaitlistOfferResponse createOffer(CreateWaitlistOfferRequest request) {
        validateCreateOfferRequest(request);

        WaitlistEntry entry = waitlistEntryRepository.findById(request.getWaitlistEntryId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        validateOfferableEntry(entry, request);

        if (waitlistOfferRepository.existsByWaitlistEntryIdAndStatus(
                entry.getId(),
                WaitlistOfferStatus.CREATED
        )) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        WaitlistOffer offer = WaitlistOffer.builder()
                .waitlistEntry(entry)
                .ticketType(entry.getTicketType())
                .quantity(request.getQuantity())
                .status(WaitlistOfferStatus.CREATED)
                .expiresAt(request.getExpiresAt())
                .build();

        entry.setStatus(WaitlistEntryStatus.OFFERED);
        waitlistEntryRepository.save(entry);

        return toResponse(waitlistOfferRepository.save(offer));
    }

    @Override
    public PageResponse<WaitlistOfferResponse> getMyOffers(Pageable pageable) {
        requireCustomer();

        String customerId = currentUserService.getCurrentUserId();
        Page<WaitlistOfferResponse> page = waitlistOfferRepository.findByWaitlistEntryCustomerId(customerId, pageable)
                .map(this::toResponse);

        return PageResponse.<WaitlistOfferResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private void validateCreateOfferRequest(CreateWaitlistOfferRequest request) {
        if (request == null
                || !StringUtils.hasText(request.getWaitlistEntryId())
                || request.getQuantity() == null
                || request.getQuantity() <= 0
                || request.getExpiresAt() == null
                || !request.getExpiresAt().isAfter(Instant.now())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validateOfferableEntry(WaitlistEntry entry, CreateWaitlistOfferRequest request) {
        if (entry.getStatus() != WaitlistEntryStatus.WAITING
                || entry.getQuantity() == null
                || request.getQuantity() > entry.getQuantity()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void requireCustomer() {
        if (currentUserService.getCurrentUserRole() != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private WaitlistOfferResponse toResponse(WaitlistOffer offer) {
        WaitlistEntry entry = offer.getWaitlistEntry();
        TicketType ticketType = offer.getTicketType();
        Event event = ticketType.getEvent();

        return WaitlistOfferResponse.builder()
                .id(offer.getId())
                .waitlistEntryId(entry.getId())
                .customerId(entry.getCustomer().getId())
                .ticketTypeId(ticketType.getId())
                .ticketTypeName(ticketType.getName())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .quantity(offer.getQuantity())
                .status(offer.getStatus())
                .expiresAt(offer.getExpiresAt())
                .acceptedAt(offer.getAcceptedAt())
                .createdAt(offer.getCreatedAt())
                .build();
    }
}
