package com.eventhub.eventhub_backend.waitlist.service.Impl;

import com.eventhub.eventhub_backend.booking.dto.request.BookingItemRequest;
import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.event.TicketAvailabilityChangedEvent;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import com.eventhub.eventhub_backend.waitlist.exception.WaitlistOfferExpiredException;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistOfferRepository;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import com.eventhub.eventhub_backend.notification.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import jakarta.transaction.Transactional;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WaitlistOfferServiceImpl implements WaitlistOfferService {

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final WaitlistOfferRepository waitlistOfferRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final BookingService bookingService;
    private final CurrentUserService currentUserService;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;

    @Value("${eventhub.waitlist.offer-ttl-seconds:900}")
    private long offerTtlSeconds = 900;

    @PostConstruct
    void validateOfferTtl() {
        if (offerTtlSeconds <= 0) {
            throw new IllegalArgumentException("eventhub.waitlist.offer-ttl-seconds phải lớn hơn 0");
        }
    }

    @Override
    @Transactional
    public WaitlistOfferResponse createOffer(CreateWaitlistOfferRequest request) {
        validateCreateOfferRequest(request);

        String typeId = waitlistEntryRepository.findTicketTypeIdById(request.getWaitlistEntryId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        TicketType type = lockTicketType(typeId);
        WaitlistEntry entry = waitlistEntryRepository.findById(request.getWaitlistEntryId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        validateOfferableEntry(entry, request);

        if (!isPublished(type) || request.getQuantity() > calculateOfferBudget(type)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

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
    @Transactional(dontRollbackOn = WaitlistOfferExpiredException.class)
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
            eventPublisher.publishEvent(new TicketAvailabilityChangedEvent(offer.getTicketType().getId()));
            throw new WaitlistOfferExpiredException();
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

        WaitlistOffer saved = waitlistOfferRepository.save(offer);
        eventPublisher.publishEvent(new TicketAvailabilityChangedEvent(offer.getTicketType().getId()));
        return toResponse(saved);
    }

    @Override
    @Transactional
    public int expireCreatedOffers(Instant now) {
        if (now == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        int count = 0;
        for (String typeId : waitlistOfferRepository.findExpiredTicketTypeIds(WaitlistOfferStatus.CREATED, now)) {
            lockTicketType(typeId);
            List<WaitlistOffer> expiredOffers = waitlistOfferRepository
                    .findByTicketTypeIdAndStatusAndExpiresAtLessThanEqualOrderByIdAsc(typeId, WaitlistOfferStatus.CREATED, now);
            expiredOffers.forEach(this::expireOffer);
            count += expiredOffers.size();
            if (!expiredOffers.isEmpty()) {
                eventPublisher.publishEvent(new TicketAvailabilityChangedEvent(typeId));
            }
        }
        return count;
    }

    @Override
    @Transactional
    public Optional<WaitlistOfferResponse> offerNextEligibleEntry(String ticketTypeId, Instant expiresAt) {
        if (!StringUtils.hasText(ticketTypeId) || expiresAt == null || !expiresAt.isAfter(Instant.now())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        TicketType type = lockTicketType(ticketTypeId);
        if (!isPublished(type)) return Optional.empty();
        int availableQuantity = calculateOfferBudget(type);
        if (availableQuantity <= 0) {
            return Optional.empty();
        }

        return waitlistEntryRepository.findFirstByTicketTypeIdAndStatusAndQuantityLessThanEqualOrderByCreatedAtAscIdAsc(
                        ticketTypeId,
                        WaitlistEntryStatus.WAITING,
                        availableQuantity
                )
                .map(entry -> toResponse(createOfferForEntry(entry, entry.getQuantity(), expiresAt)));
    }

    @Override
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public int offerAvailableEntries(String ticketTypeId) {
        TicketType type = lockTicketType(ticketTypeId);
        if (!isPublished(type)) return 0;
        int remaining = calculateOfferBudget(type);
        int count = 0;
        Instant expiresAt = Instant.now().plusSeconds(offerTtlSeconds);
        while (remaining > 0) {
            Optional<WaitlistEntry> next = waitlistEntryRepository
                    .findFirstByTicketTypeIdAndStatusAndQuantityLessThanEqualOrderByCreatedAtAscIdAsc(
                            ticketTypeId, WaitlistEntryStatus.WAITING, remaining);
            if (next.isEmpty()) break;
            WaitlistEntry entry = next.get();
            createOfferForEntry(entry, entry.getQuantity(), expiresAt);
            remaining -= entry.getQuantity();
            count++;
        }
        return count;
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

    private int calculateOfferBudget(TicketType ticketType) {
        int quantity = ticketType.getQuantity() == null ? 0 : ticketType.getQuantity();
        int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
        long offered = waitlistOfferRepository.sumQuantityByTicketTypeAndStatus(ticketType.getId(), WaitlistOfferStatus.CREATED);
        return (int) Math.max(0L, (long) quantity - soldQuantity - offered);
    }

    private TicketType lockTicketType(String ticketTypeId) {
        if (!StringUtils.hasText(ticketTypeId)) throw new AppException(ErrorCode.INVALID_REQUEST);
        return ticketTypeRepository.findByIdForUpdate(ticketTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));
    }

    private boolean isPublished(TicketType type) {
        return type.getEvent() != null && type.getEvent().getStatus() == EventStatus.PUBLISHED;
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

        String typeId = waitlistOfferRepository.findTicketTypeIdById(offerId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        lockTicketType(typeId);
        return waitlistOfferRepository.findByIdForUpdate(offerId)
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

        WaitlistOffer savedOffer = waitlistOfferRepository.save(offer);
        if (emailService != null) {
            try {
                emailService.sendWaitlistOfferEmail(savedOffer);
            } catch (Exception e) {
                log.warn("Could not dispatch waitlist offer email for offer {}: {}", savedOffer.getId(), e.getMessage());
            }
        }
        return savedOffer;
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
