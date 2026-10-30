package com.eventhub.eventhub_backend.event.service.Impl;

import com.eventhub.eventhub_backend.admin.dto.response.EventStatsResponse;
import com.eventhub.eventhub_backend.admin.dto.response.TicketTypeStatsDto;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.EventStatsService;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import com.eventhub.eventhub_backend.ticketing.repository.TicketRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventStatsServiceImpl implements EventStatsService {

    EventRepository eventRepository;
    BookingRepository bookingRepository;
    TicketTypeRepository ticketTypeRepository;
    TicketRepository ticketRepository;
    WaitlistEntryRepository waitlistEntryRepository;
    CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public EventStatsResponse getEventStats(String eventId) {
        if (!StringUtils.hasText(eventId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        validateOrganizerOrAdmin(event);

        BigDecimal totalRevenue = bookingRepository.sumRevenueByEventIdAndBookingStatus(eventId, BookingStatus.CONFIRMED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        List<TicketType> ticketTypes = ticketTypeRepository.findByEventId(eventId);
        List<TicketTypeStatsDto> ticketTypeDtos = new ArrayList<>();

        long totalCapacity = 0;
        long totalSold = 0;

        for (TicketType tt : ticketTypes) {
            int qty = tt.getQuantity() != null ? tt.getQuantity() : 0;
            int sold = tt.getSoldQuantity() != null ? tt.getSoldQuantity() : 0;
            int available = Math.max(0, qty - sold);
            double occupancy = qty > 0 ? BigDecimal.valueOf((double) sold * 100 / qty).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;

            totalCapacity += qty;
            totalSold += sold;

            ticketTypeDtos.add(TicketTypeStatsDto.builder()
                    .ticketTypeId(tt.getId())
                    .name(tt.getName())
                    .price(tt.getPrice())
                    .quantity(qty)
                    .soldQuantity(sold)
                    .availableQuantity(available)
                    .occupancyRate(occupancy)
                    .build());
        }

        double overallOccupancy = totalCapacity > 0
                ? BigDecimal.valueOf((double) totalSold * 100 / totalCapacity).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        long checkedInTickets = ticketRepository.countByTicketTypeEventIdAndStatus(eventId, TicketStatus.USED);
        long waitingCount = waitlistEntryRepository.countByTicketTypeEventIdAndStatus(eventId, WaitlistEntryStatus.WAITING);

        return EventStatsResponse.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .status(event.getStatus())
                .totalRevenue(totalRevenue)
                .totalCapacity(totalCapacity)
                .totalSold(totalSold)
                .occupancyRate(overallOccupancy)
                .checkedInTickets(checkedInTickets)
                .waitingCount(waitingCount)
                .ticketTypes(ticketTypeDtos)
                .build();
    }

    private void validateOrganizerOrAdmin(Event event) {
        Role role = currentUserService.getCurrentUserRole();
        if (role == Role.ADMIN) {
            return;
        }

        if (role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getOrganizer() == null || !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
