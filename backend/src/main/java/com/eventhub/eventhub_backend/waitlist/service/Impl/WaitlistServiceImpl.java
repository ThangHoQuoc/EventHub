package com.eventhub.eventhub_backend.waitlist.service.Impl;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.dto.request.JoinWaitlistRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistEntryResponse;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WaitlistServiceImpl implements WaitlistService {

    public static final List<WaitlistEntryStatus> ACTIVE_STATUSES = List.of(
            WaitlistEntryStatus.WAITING,
            WaitlistEntryStatus.OFFERED
    );

    private final WaitlistEntryRepository waitlistEntryRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public WaitlistEntryResponse joinWaitlist(String ticketTypeId, JoinWaitlistRequest request) {
        requireCustomer();
        validateJoinRequest(ticketTypeId, request);

        String customerId = currentUserService.getCurrentUserId();
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));

        validateJoinableTicketType(ticketType);

        if (waitlistEntryRepository.existsByCustomerIdAndTicketTypeIdAndStatusIn(
                customerId,
                ticketTypeId,
                ACTIVE_STATUSES
        )) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        WaitlistEntry entry = WaitlistEntry.builder()
                .customer(customer)
                .ticketType(ticketType)
                .quantity(request.getQuantity())
                .status(WaitlistEntryStatus.WAITING)
                .build();

        return toResponse(waitlistEntryRepository.save(entry));
    }

    @Override
    public PageResponse<WaitlistEntryResponse> getMyWaitlist(Pageable pageable) {
        requireCustomer();

        String customerId = currentUserService.getCurrentUserId();
        Page<WaitlistEntryResponse> page = waitlistEntryRepository.findByCustomerId(customerId, pageable)
                .map(this::toResponse);

        return PageResponse.<WaitlistEntryResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private void requireCustomer() {
        if (currentUserService.getCurrentUserRole() != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateJoinRequest(String ticketTypeId, JoinWaitlistRequest request) {
        if (!StringUtils.hasText(ticketTypeId)
                || request == null
                || request.getQuantity() == null
                || request.getQuantity() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validateJoinableTicketType(TicketType ticketType) {
        Event event = ticketType.getEvent();
        if (event == null || event.getStatus() != EventStatus.PUBLISHED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        int quantity = ticketType.getQuantity() == null ? 0 : ticketType.getQuantity();
        int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
        int availableQuantity = quantity - soldQuantity;

        if (availableQuantity > 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private WaitlistEntryResponse toResponse(WaitlistEntry entry) {
        TicketType ticketType = entry.getTicketType();
        Event event = ticketType.getEvent();

        return WaitlistEntryResponse.builder()
                .id(entry.getId())
                .customerId(entry.getCustomer().getId())
                .ticketTypeId(ticketType.getId())
                .ticketTypeName(ticketType.getName())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .quantity(entry.getQuantity())
                .status(entry.getStatus())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
