package com.eventhub.eventhub_backend.ticketing.service.Impl;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import com.eventhub.eventhub_backend.ticketing.repository.TicketRepository;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public List<TicketResponse> issueTicketsForBooking(Booking booking) {
        validateIssuableBooking(booking);

        List<Ticket> existingTickets = ticketRepository.findByBookingId(booking.getId());
        if (!existingTickets.isEmpty()) {
            return existingTickets.stream()
                    .map(this::toResponse)
                    .toList();
        }

        List<Ticket> tickets = new ArrayList<>();
        int sequence = 1;

        for (BookingItem item : booking.getItems()) {
            validateBookingItem(item);

            for (int index = 0; index < item.getQuantity(); index++) {
                String ticketCode = buildTicketCode(booking.getId(), sequence++);
                tickets.add(Ticket.builder()
                        .booking(booking)
                        .ticketType(item.getTicketType())
                        .customer(booking.getCustomer())
                        .ticketCode(ticketCode)
                        .qrPayload(buildQrPayload(ticketCode))
                        .status(TicketStatus.VALID)
                        .build());
            }
        }

        return ticketRepository.saveAll(tickets).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PageResponse<TicketResponse> getMyTickets(Pageable pageable) {
        requireCustomer();

        String customerId = currentUserService.getCurrentUserId();
        Page<TicketResponse> page = ticketRepository.findByCustomerId(customerId, pageable)
                .map(this::toResponse);

        return PageResponse.<TicketResponse>builder()
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
    public TicketResponse getMyTicket(String ticketId) {
        requireCustomer();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        validateOwner(ticket);

        return toResponse(ticket);
    }

    private void validateIssuableBooking(Booking booking) {
        if (booking == null || !StringUtils.hasText(booking.getId())
                || booking.getStatus() != BookingStatus.CONFIRMED
                || booking.getCustomer() == null
                || booking.getItems() == null || booking.getItems().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void validateBookingItem(BookingItem item) {
        if (item == null || item.getTicketType() == null
                || item.getQuantity() == null || item.getQuantity() <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void requireCustomer() {
        if (currentUserService.getCurrentUserRole() != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateOwner(Ticket ticket) {
        if (ticket.getCustomer() == null
                || !currentUserService.getCurrentUserId().equals(ticket.getCustomer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private String buildTicketCode(String bookingId, int sequence) {
        return "EVH-" + bookingId + "-" + sequence;
    }

    private String buildQrPayload(String ticketCode) {
        return "EVENTHUB|TICKET|" + ticketCode;
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketType ticketType = ticket.getTicketType();
        Event event = ticketType.getEvent();
        User customer = ticket.getCustomer();

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .qrPayload(ticket.getQrPayload())
                .status(ticket.getStatus())
                .bookingId(ticket.getBooking().getId())
                .customerId(customer.getId())
                .ticketTypeId(ticketType.getId())
                .ticketTypeName(ticketType.getName())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .issuedAt(ticket.getCreatedAt())
                .checkedInAt(ticket.getCheckedInAt())
                .build();
    }
}
