package com.eventhub.eventhub_backend.admin.service.Impl;

import com.eventhub.eventhub_backend.admin.dto.response.AdminPlatformStatsResponse;
import com.eventhub.eventhub_backend.admin.dto.response.TopEventStatsDto;
import com.eventhub.eventhub_backend.admin.service.AdminStatsService;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatsServiceImpl implements AdminStatsService {

    BookingRepository bookingRepository;
    TicketTypeRepository ticketTypeRepository;
    EventRepository eventRepository;
    UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminPlatformStatsResponse getPlatformStats() {
        BigDecimal totalRevenue = bookingRepository.sumTotalAmountByStatus(BookingStatus.CONFIRMED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalTicketsSold = ticketTypeRepository.sumSoldQuantity();
        long totalActiveEvents = eventRepository.countByStatus(EventStatus.PUBLISHED);
        long totalUsers = userRepository.count();

        // Lấy top 5 sự kiện doanh thu cao nhất
        List<Event> publishedEvents = eventRepository.findByStatus(EventStatus.PUBLISHED);
        List<TopEventStatsDto> topEvents = new ArrayList<>();

        for (Event event : publishedEvents) {
            BigDecimal revenue = bookingRepository.sumRevenueByEventIdAndBookingStatus(event.getId(), BookingStatus.CONFIRMED);
            if (revenue == null) {
                revenue = BigDecimal.ZERO;
            }

            long soldTickets = 0;
            if (event.getTicketTypes() != null) {
                soldTickets = event.getTicketTypes().stream()
                        .mapToLong(tt -> tt.getSoldQuantity() != null ? tt.getSoldQuantity() : 0)
                        .sum();
            }

            topEvents.add(TopEventStatsDto.builder()
                    .eventId(event.getId())
                    .title(event.getTitle())
                    .category(event.getCategory() != null ? event.getCategory() : "OTHER")
                    .thumbnailUrl(event.getThumbnailUrl())
                    .revenue(revenue)
                    .soldTickets(soldTickets)
                    .build());
        }

        topEvents.sort(Comparator.comparing(TopEventStatsDto::getRevenue).reversed());
        if (topEvents.size() > 5) {
            topEvents = topEvents.subList(0, 5);
        }

        return AdminPlatformStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTicketsSold(totalTicketsSold)
                .totalActiveEvents(totalActiveEvents)
                .totalUsers(totalUsers)
                .topEvents(topEvents)
                .build();
    }
}
