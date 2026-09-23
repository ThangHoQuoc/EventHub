package com.eventhub.eventhub_backend.waitlist.service.Impl;

import com.eventhub.eventhub_backend.booking.dto.request.BookingItemRequest;
import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WaitlistOfferServiceImpl implements WaitlistOfferService {

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final WaitlistOfferRepository waitlistOfferRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final BookingService bookingService;
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

        return toResponse(createOfferForEntry(entry, request.getQuantity(), request.getExpiresAt()));
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

    @Override
    @Transactional
    public WaitlistOfferResponse acceptOffer(String offerId) {
        requireCustomer();

        WaitlistOffer offer = findOffer(offerId);
        validateOfferOwner(offer);

        if (offer.getStatus() == WaitlistOfferStatus.CONVERTED_TO_BOOKING) {
            return toResponse(offer);
        }

        if (offer.getStatus() != WaitlistOfferStatus.CREATED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (!offer.getExpiresAt().isAfter(Instant.now())) {
            expireOffer(offer);
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        BookingResponse booking = bookingService.createBooking(CreateBookingRequest.builder()
                .items(List.of(BookingItemRequest.builder()
                        .ticketTypeId(offer.getTicketType().getId())
                        .quantity(offer.getQuantity())
                        .build()))
                .build());

        WaitlistEntry entry = offer.getWaitlistEntry();
        offer.setStatus(WaitlistOfferStatus.CONVERTED_TO_BOOKING);
        offer.setAcceptedAt(Instant.now());
        offer.setConvertedBookingId(booking.getId());
        entry.setStatus(WaitlistEntryStatus.CONVERTED);
        waitlistEntryRepository.save(entry);

        return toResponse(waitlistOfferRepository.save(offer));
    }

    @Override
    @Transactional
    public WaitlistOfferResponse skipOffer(String offerId) {
        requireCustomer();

        WaitlistOffer offer = findOffer(offerId);
        validateOfferOwner(offer);

        if (offer.getStatus() == WaitlistOfferStatus.SKIPPED) {
            return toResponse(offer);
        }

        if (offer.getStatus() != WaitlistOfferStatus.CREATED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        WaitlistEntry entry = offer.getWaitlistEntry();
        offer.setStatus(WaitlistOfferStatus.SKIPPED);
        entry.setStatus(WaitlistEntryStatus.SKIPPED);
        waitlistEntryRepository.save(entry);

        return toResponse(waitlistOfferRepository.save(offer));
    }

    @Override
    @Transactional
    public int expireCreatedOffers(Instant now) {
        if (now == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<WaitlistOffer> expiredOffers = waitlistOfferRepository.findByStatusAndExpiresAtBefore(
                WaitlistOfferStatus.CREATED,
                now
        );

        expiredOffers.forEach(this::expireOffer);
        return expiredOffers.size();
    }

    @Override
    @Transactional
    public Optional<WaitlistOfferResponse> offerNextEligibleEntry(String ticketTypeId, Instant expiresAt) {
        if (!StringUtils.hasText(ticketTypeId) || expiresAt == null || !expiresAt.isAfter(Instant.now())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        int availableQuantity = calculateAvailableQuantityLimit(ticketTypeId);
        if (availableQuantity <= 0) {
            return Optional.empty();
        }

        return waitlistEntryRepository.findFirstByTicketTypeIdAndStatusAndQuantityLessThanEqualOrderByCreatedAtAsc(
                        ticketTypeId,
                        WaitlistEntryStatus.WAITING,
                        availableQuantity
                )
                .map(entry -> toResponse(createOfferForEntry(entry, entry.getQuantity(), expiresAt)));
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

    private Integer calculateAvailableQuantityLimit(String ticketTypeId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));
        int quantity = ticketType.getQuantity() == null ? 0 : ticketType.getQuantity();
        int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();

        return Math.max(0, quantity - soldQuantity);
    }

    private void requireCustomer() {
        if (currentUserService.getCurrentUserRole() != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private WaitlistOffer findOffer(String offerId) {
        if (!StringUtils.hasText(offerId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return waitlistOfferRepository.findById(offerId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private void validateOfferOwner(WaitlistOffer offer) {
        String customerId = offer.getWaitlistEntry().getCustomer().getId();
        if (!currentUserService.getCurrentUserId().equals(customerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private WaitlistOffer createOfferForEntry(WaitlistEntry entry, Integer quantity, Instant expiresAt) {
        if (waitlistOfferRepository.existsByWaitlistEntryIdAndStatus(
                entry.getId(),
                WaitlistOfferStatus.CREATED
        )) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        WaitlistOffer offer = WaitlistOffer.builder()
                .waitlistEntry(entry)
                .ticketType(entry.getTicketType())
                .quantity(quantity)
                .status(WaitlistOfferStatus.CREATED)
                .expiresAt(expiresAt)
                .build();

        entry.setStatus(WaitlistEntryStatus.OFFERED);
        waitlistEntryRepository.save(entry);

        return waitlistOfferRepository.save(offer);
    }

    private void expireOffer(WaitlistOffer offer) {
        WaitlistEntry entry = offer.getWaitlistEntry();
        offer.setStatus(WaitlistOfferStatus.EXPIRED);
        entry.setStatus(WaitlistEntryStatus.EXPIRED);
        waitlistEntryRepository.save(entry);
        waitlistOfferRepository.save(offer);
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
                .bookingId(offer.getConvertedBookingId())
                .createdAt(offer.getCreatedAt())
                .build();
    }
}
