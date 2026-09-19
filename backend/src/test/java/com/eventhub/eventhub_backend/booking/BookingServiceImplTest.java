package com.eventhub.eventhub_backend.booking;

import com.eventhub.eventhub_backend.booking.dto.request.BookingItemRequest;
import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.booking.service.Impl.BookingServiceImpl;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
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

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final BookingServiceImpl bookingService = new BookingServiceImpl(
            bookingRepository,
            ticketTypeRepository,
            userRepository,
            currentUserService
    );

    @Test
    void createBooking_shouldCreatePendingPaymentBookingForCustomer() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", createEvent(EventStatus.PUBLISHED));
        CreateBookingRequest request = CreateBookingRequest.builder()
                .items(List.of(BookingItemRequest.builder()
                        .ticketTypeId("ticket-type-1")
                        .quantity(2)
                        .build()))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId("booking-1");
            return booking;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response.getId()).isEqualTo("booking-1");
        assertThat(response.getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getStatus()).isEqualTo(BookingStatus.PENDING_PAYMENT);
        assertThat(response.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().getFirst().getTicketTypeId()).isEqualTo("ticket-type-1");
        assertThat(response.getItems().getFirst().getUnitPrice()).isEqualByComparingTo(BigDecimal.valueOf(500000));
        assertThat(response.getItems().getFirst().getSubtotal()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldNotIncreaseSoldQuantityForPendingPaymentBooking() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", createEvent(EventStatus.PUBLISHED));
        CreateBookingRequest request = createSingleItemRequest("ticket-type-1", 2);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.createBooking(request);

        assertThat(response.getStatus()).isEqualTo(BookingStatus.PENDING_PAYMENT);
        assertThat(vip.getSoldQuantity()).isEqualTo(25);
        verify(ticketTypeRepository, never()).save(any(TicketType.class));
    }

    @Test
    void createBooking_shouldRejectNonCustomerRole() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .items(List.of(BookingItemRequest.builder()
                        .ticketTypeId("ticket-type-1")
                        .quantity(1)
                        .build()))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldRejectUnpublishedEvent() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", createEvent(EventStatus.DRAFT));
        CreateBookingRequest request = createSingleItemRequest("ticket-type-1", 1);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldRejectWhenAvailableQuantityIsNotEnough() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", createEvent(EventStatus.PUBLISHED));
        CreateBookingRequest request = createSingleItemRequest("ticket-type-1", 80);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_shouldRejectTicketTypesFromDifferentEvents() {
        User customer = createCustomer("customer-1");
        Event eventOne = createEvent(EventStatus.PUBLISHED);
        Event eventTwo = createEvent(EventStatus.PUBLISHED);
        eventTwo.setId("event-2");
        TicketType vip = createTicketType("ticket-type-1", eventOne);
        TicketType standard = createTicketType("ticket-type-2", eventTwo);
        CreateBookingRequest request = CreateBookingRequest.builder()
                .items(List.of(
                        BookingItemRequest.builder().ticketTypeId("ticket-type-1").quantity(1).build(),
                        BookingItemRequest.builder().ticketTypeId("ticket-type-2").quantity(1).build()
                ))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(ticketTypeRepository.findById("ticket-type-2")).thenReturn(Optional.of(standard));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void getMyBookings_shouldReturnCurrentCustomerBookings() {
        Booking booking = createBooking("booking-1", "customer-1", BookingStatus.PENDING_PAYMENT);
        PageRequest pageable = PageRequest.of(0, 10);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(bookingRepository.findByCustomerId("customer-1", pageable))
                .thenReturn(new PageImpl<>(List.of(booking), pageable, 1));

        var response = bookingService.getMyBookings(pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().getFirst().getId()).isEqualTo("booking-1");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getBooking_shouldRejectWhenCustomerDoesNotOwnBooking() {
        Booking booking = createBooking("booking-1", "customer-2", BookingStatus.PENDING_PAYMENT);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.getBooking("booking-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    void cancelBooking_shouldCancelPendingPaymentBookingForOwner() {
        Booking booking = createBooking("booking-1", "customer-1", BookingStatus.PENDING_PAYMENT);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        BookingResponse response = bookingService.cancelBooking("booking-1");

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_shouldRejectConfirmedBooking() {
        Booking booking = createBooking("booking-1", "customer-1", BookingStatus.CONFIRMED);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("booking-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(bookingRepository, never()).save(booking);
    }

    private CreateBookingRequest createSingleItemRequest(String ticketTypeId, int quantity) {
        return CreateBookingRequest.builder()
                .items(List.of(BookingItemRequest.builder()
                        .ticketTypeId(ticketTypeId)
                        .quantity(quantity)
                        .build()))
                .build();
    }

    private Booking createBooking(String id, String customerId, BookingStatus status) {
        User customer = createCustomer(customerId);
        Event event = createEvent(EventStatus.PUBLISHED);
        TicketType ticketType = createTicketType("ticket-type-1", event);
        Booking booking = Booking.builder()
                .customer(customer)
                .status(status)
                .totalAmount(BigDecimal.valueOf(500000))
                .build();
        booking.setId(id);
        booking.setItems(List.of());
        return booking;
    }

    private TicketType createTicketType(String id, Event event) {
        TicketType ticketType = TicketType.builder()
                .name("VIP")
                .price(BigDecimal.valueOf(500000))
                .quantity(100)
                .soldQuantity(25)
                .event(event)
                .build();
        ticketType.setId(id);
        return ticketType;
    }

    private Event createEvent(EventStatus status) {
        Event event = Event.builder()
                .title("Java Workshop")
                .status(status)
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
