package com.eventhub.eventhub_backend.event;

import com.eventhub.eventhub_backend.admin.dto.response.EventStatsResponse;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.Impl.EventStatsServiceImpl;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import com.eventhub.eventhub_backend.ticketing.repository.TicketRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class EventStatsServiceImplTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final TicketRepository ticketRepository = mock(TicketRepository.class);
    private final WaitlistEntryRepository waitlistEntryRepository = mock(WaitlistEntryRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private EventStatsServiceImpl eventStatsService;

    @BeforeEach
    void setUp() {
        eventStatsService = new EventStatsServiceImpl(
                eventRepository,
                bookingRepository,
                ticketTypeRepository,
                ticketRepository,
                waitlistEntryRepository,
                currentUserService
        );
    }

    @Test
    void getEventStats_shouldReturnDetailedMetrics() {
        User organizer = User.builder().fullName("Organizer Pro").build();
        organizer.setId("org-1");

        Event event = Event.builder()
                .title("Workshop AI 2026")
                .status(EventStatus.PUBLISHED)
                .organizer(organizer)
                .build();
        event.setId("event-1");

        TicketType tt1 = TicketType.builder().name("VIP").price(BigDecimal.valueOf(1000000)).quantity(50).soldQuantity(40).build();
        tt1.setId("tt-1");

        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("org-1");

        when(bookingRepository.sumRevenueByEventIdAndBookingStatus("event-1", BookingStatus.CONFIRMED))
                .thenReturn(BigDecimal.valueOf(40000000));
        when(ticketTypeRepository.findByEventId("event-1")).thenReturn(List.of(tt1));
        when(ticketRepository.countByTicketTypeEventIdAndStatus("event-1", TicketStatus.USED)).thenReturn(25L);
        when(waitlistEntryRepository.countByTicketTypeEventIdAndStatus("event-1", WaitlistEntryStatus.WAITING)).thenReturn(8L);

        EventStatsResponse response = eventStatsService.getEventStats("event-1");

        assertThat(response.getTitle()).isEqualTo("Workshop AI 2026");
        assertThat(response.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(40000000));
        assertThat(response.getTotalCapacity()).isEqualTo(50L);
        assertThat(response.getTotalSold()).isEqualTo(40L);
        assertThat(response.getOccupancyRate()).isEqualTo(80.0);
        assertThat(response.getCheckedInTickets()).isEqualTo(25L);
        assertThat(response.getWaitingCount()).isEqualTo(8L);
        assertThat(response.getTicketTypes()).hasSize(1);
        assertThat(response.getTicketTypes().get(0).getAvailableQuantity()).isEqualTo(10);
    }

    @Test
    void getEventStats_whenDifferentOrganizer_shouldThrowUnauthorized() {
        User organizer = User.builder().fullName("Organizer Pro").build();
        organizer.setId("org-1");

        Event event = Event.builder().organizer(organizer).build();
        event.setId("event-1");

        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("other-org");

        assertThatThrownBy(() -> eventStatsService.getEventStats("event-1"))
                .isInstanceOf(AppException.class);
    }
}
