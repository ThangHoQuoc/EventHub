package com.eventhub.eventhub_backend.ticketing;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import com.eventhub.eventhub_backend.ticketing.repository.TicketRepository;
import com.eventhub.eventhub_backend.ticketing.service.Impl.TicketServiceImpl;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TicketServiceImplTest {

    private final TicketRepository ticketRepository = mock(TicketRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final TicketServiceImpl ticketService = new TicketServiceImpl(
            ticketRepository,
            currentUserService
    );

    @Test
    void issueTicketsForBooking_shouldCreateOneTicketPerBookedQuantity() {
        TicketType vip = createTicketType("ticket-type-1", "VIP");
        Booking booking = createBooking("booking-1", BookingStatus.CONFIRMED, vip, 2);

        when(ticketRepository.findByBookingId("booking-1")).thenReturn(List.of());
        when(ticketRepository.saveAll(any())).thenAnswer(invocation -> {
            List<Ticket> tickets = invocation.getArgument(0);
            for (int index = 0; index < tickets.size(); index++) {
                tickets.get(index).setId("ticket-" + (index + 1));
            }
            return tickets;
        });

        List<TicketResponse> responses = ticketService.issueTicketsForBooking(booking);

        assertThat(responses).hasSize(2);
        assertThat(responses)
                .extracting(TicketResponse::getStatus)
                .containsOnly(TicketStatus.VALID);
        assertThat(responses)
                .extracting(TicketResponse::getTicketCode)
                .containsExactly("EVH-booking-1-1", "EVH-booking-1-2");
        assertThat(responses.getFirst().getQrPayload()).isEqualTo("EVENTHUB|TICKET|EVH-booking-1-1");
        verify(ticketRepository).saveAll(any());
    }

    @Test
    void issueTicketsForBooking_shouldReturnExistingTicketsWhenBookingAlreadyIssued() {
        TicketType vip = createTicketType("ticket-type-1", "VIP");
        Booking booking = createBooking("booking-1", BookingStatus.CONFIRMED, vip, 2);
        Ticket existingTicket = createTicket("ticket-1", booking, vip, "EVH-booking-1-1");

        when(ticketRepository.findByBookingId("booking-1")).thenReturn(List.of(existingTicket));

        List<TicketResponse> responses = ticketService.issueTicketsForBooking(booking);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().getTicketCode()).isEqualTo("EVH-booking-1-1");
        verify(ticketRepository, never()).saveAll(any());
    }

    @Test
    void issueTicketsForBooking_shouldRejectNonConfirmedBooking() {
        TicketType vip = createTicketType("ticket-type-1", "VIP");
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);

        assertThatThrownBy(() -> ticketService.issueTicketsForBooking(booking))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(ticketRepository, never()).saveAll(any());
    }

    @Test
    void getMyTickets_shouldReturnCurrentCustomerTickets() {
        TicketType vip = createTicketType("ticket-type-1", "VIP");
        Booking booking = createBooking("booking-1", BookingStatus.CONFIRMED, vip, 1);
        Ticket ticket = createTicket("ticket-1", booking, vip, "EVH-booking-1-1");
        PageRequest pageable = PageRequest.of(0, 10);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(ticketRepository.findByCustomerId("customer-1", pageable))
                .thenReturn(new PageImpl<>(List.of(ticket), pageable, 1));

        var response = ticketService.getMyTickets(pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().getFirst().getId()).isEqualTo("ticket-1");
        assertThat(response.getContent().getFirst().getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getMyTicket_shouldRejectTicketOwnedByAnotherCustomer() {
        TicketType vip = createTicketType("ticket-type-1", "VIP");
        Booking booking = createBooking("booking-1", BookingStatus.CONFIRMED, vip, 1);
        booking.setCustomer(createCustomer("customer-2"));
        Ticket ticket = createTicket("ticket-1", booking, vip, "EVH-booking-1-1");

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(ticketRepository.findById("ticket-1")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.getMyTicket("ticket-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    private Booking createBooking(String id, BookingStatus status, TicketType ticketType, int quantity) {
        Booking booking = Booking.builder()
                .customer(createCustomer("customer-1"))
                .status(status)
                .totalAmount(ticketType.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .build();
        booking.setId(id);

        BookingItem item = BookingItem.builder()
                .booking(booking)
                .ticketType(ticketType)
                .quantity(quantity)
                .unitPrice(ticketType.getPrice())
                .subtotal(ticketType.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .build();
        item.setId("booking-item-1");
        booking.setItems(List.of(item));

        return booking;
    }

    private Ticket createTicket(String id, Booking booking, TicketType ticketType, String ticketCode) {
        Ticket ticket = Ticket.builder()
                .booking(booking)
                .ticketType(ticketType)
                .customer(booking.getCustomer())
                .ticketCode(ticketCode)
                .qrPayload("EVENTHUB|TICKET|" + ticketCode)
                .status(TicketStatus.VALID)
                .build();
        ticket.setId(id);
        return ticket;
    }

    private TicketType createTicketType(String id, String name) {
        TicketType ticketType = TicketType.builder()
                .name(name)
                .price(BigDecimal.valueOf(500000))
                .quantity(100)
                .soldQuantity(25)
                .event(createEvent())
                .build();
        ticketType.setId(id);
        return ticketType;
    }

    private Event createEvent() {
        Event event = Event.builder()
                .title("Java Workshop")
                .status(EventStatus.PUBLISHED)
                .startAt(Instant.now().plusSeconds(3600))
                .endAt(Instant.now().plusSeconds(7200))
                .build();
        event.setId("event-1");
        return event;
    }

    private User createCustomer(String id) {
        User customer = User.builder()
                .role(Role.CUSTOMER)
                .build();
        customer.setId(id);
        return customer;
    }
}
