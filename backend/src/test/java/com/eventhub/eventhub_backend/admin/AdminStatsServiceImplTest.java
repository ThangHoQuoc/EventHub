package com.eventhub.eventhub_backend.admin;

import com.eventhub.eventhub_backend.admin.dto.response.AdminPlatformStatsResponse;
import com.eventhub.eventhub_backend.admin.service.Impl.AdminStatsServiceImpl;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AdminStatsServiceImplTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final EventRepository eventRepository = mock(EventRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private AdminStatsServiceImpl adminStatsService;

    @BeforeEach
    void setUp() {
        adminStatsService = new AdminStatsServiceImpl(
                bookingRepository,
                ticketTypeRepository,
                eventRepository,
                userRepository
        );
    }

    @Test
    void getPlatformStats_shouldCalculatePlatformMetricsAndTopEvents() {
        when(bookingRepository.sumTotalAmountByStatus(BookingStatus.CONFIRMED)).thenReturn(BigDecimal.valueOf(15000000));
        when(ticketTypeRepository.sumSoldQuantity()).thenReturn(250L);
        when(eventRepository.countByStatus(EventStatus.PUBLISHED)).thenReturn(8L);
        when(userRepository.count()).thenReturn(120L);

        TicketType tt = TicketType.builder().name("VIP").soldQuantity(50).build();
        Event event1 = Event.builder()
                .title("Concert 2026")
                .category("MUSIC")
                .status(EventStatus.PUBLISHED)
                .ticketTypes(List.of(tt))
                .build();
        event1.setId("e1");

        when(eventRepository.findByStatus(EventStatus.PUBLISHED)).thenReturn(List.of(event1));
        when(bookingRepository.sumRevenueByEventIdAndBookingStatus("e1", BookingStatus.CONFIRMED)).thenReturn(BigDecimal.valueOf(5000000));

        AdminPlatformStatsResponse stats = adminStatsService.getPlatformStats();

        assertThat(stats.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(15000000));
        assertThat(stats.getTotalTicketsSold()).isEqualTo(250L);
        assertThat(stats.getTotalActiveEvents()).isEqualTo(8L);
        assertThat(stats.getTotalUsers()).isEqualTo(120L);
        assertThat(stats.getTopEvents()).hasSize(1);
        assertThat(stats.getTopEvents().get(0).getTitle()).isEqualTo("Concert 2026");
        assertThat(stats.getTopEvents().get(0).getRevenue()).isEqualByComparingTo(BigDecimal.valueOf(5000000));
    }
}
