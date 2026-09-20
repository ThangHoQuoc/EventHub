package com.eventhub.eventhub_backend.payment;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.entity.Payment;
import com.eventhub.eventhub_backend.payment.entity.PaymentStatus;
import com.eventhub.eventhub_backend.payment.repository.PaymentRepository;
import com.eventhub.eventhub_backend.payment.service.Impl.PaymentServiceImpl;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import org.junit.jupiter.api.Test;

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

class PaymentServiceImplTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final TicketService ticketService = mock(TicketService.class);

    private final PaymentServiceImpl paymentService = new PaymentServiceImpl(
            bookingRepository,
            paymentRepository,
            ticketTypeRepository,
            ticketService
    );

    @Test
    void confirmPayment_shouldConfirmPendingBookingAndIncreaseSoldQuantity() {
        TicketType vip = createTicketType("ticket-type-1", 100, 25);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.empty());
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId("payment-1");
            return payment;
        });

        PaymentResponse response = paymentService.confirmPayment(request);

        assertThat(response.getId()).isEqualTo("payment-1");
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getBookingStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
        assertThat(vip.getSoldQuantity()).isEqualTo(27);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(ticketTypeRepository).saveAll(List.of(vip));
        verify(bookingRepository).save(booking);
        verify(paymentRepository).save(any(Payment.class));
        verify(ticketService).issueTicketsForBooking(booking);
    }

    @Test
    void confirmPayment_shouldRejectBookingThatIsNotPendingPayment() {
        TicketType vip = createTicketType("ticket-type-1", 100, 25);
        Booking booking = createBooking("booking-1", BookingStatus.CANCELLED, vip, 2);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.empty());
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> paymentService.confirmPayment(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        assertThat(vip.getSoldQuantity()).isEqualTo(25);
        verify(ticketTypeRepository, never()).saveAll(any());
        verify(bookingRepository, never()).save(booking);
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(ticketService, never()).issueTicketsForBooking(any(Booking.class));
    }

    @Test
    void confirmPayment_shouldRejectWhenInventoryIsNoLongerAvailable() {
        TicketType vip = createTicketType("ticket-type-1", 26, 25);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.empty());
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> paymentService.confirmPayment(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        assertThat(vip.getSoldQuantity()).isEqualTo(25);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING_PAYMENT);
        verify(ticketTypeRepository, never()).saveAll(any());
        verify(bookingRepository, never()).save(booking);
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(ticketService, never()).issueTicketsForBooking(any(Booking.class));
    }

    @Test
    void confirmPayment_shouldReturnExistingSuccessPaymentForSameProviderTransaction() {
        TicketType vip = createTicketType("ticket-type-1", 100, 27);
        Booking booking = createBooking("booking-1", BookingStatus.CONFIRMED, vip, 2);
        Payment existingPayment = createPayment("payment-1", booking, PaymentStatus.SUCCESS);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.of(existingPayment));

        PaymentResponse response = paymentService.confirmPayment(request);

        assertThat(response.getId()).isEqualTo("payment-1");
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(vip.getSoldQuantity()).isEqualTo(27);
        verify(bookingRepository, never()).findById(any());
        verify(ticketTypeRepository, never()).saveAll(any());
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(ticketService, never()).issueTicketsForBooking(any(Booking.class));
    }

    @Test
    void confirmPayment_shouldRejectProviderTransactionUsedByAnotherBooking() {
        TicketType vip = createTicketType("ticket-type-1", 100, 27);
        Booking otherBooking = createBooking("booking-2", BookingStatus.CONFIRMED, vip, 2);
        Payment existingPayment = createPayment("payment-1", otherBooking, PaymentStatus.SUCCESS);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.of(existingPayment));

        assertThatThrownBy(() -> paymentService.confirmPayment(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(bookingRepository, never()).findById(any());
        verify(ticketTypeRepository, never()).saveAll(any());
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(ticketService, never()).issueTicketsForBooking(any(Booking.class));
    }

    private ConfirmPaymentRequest createRequest(String bookingId, String provider, String providerTransactionId) {
        return ConfirmPaymentRequest.builder()
                .bookingId(bookingId)
                .provider(provider)
                .providerTransactionId(providerTransactionId)
                .build();
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

    private Payment createPayment(String id, Booking booking, PaymentStatus status) {
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .status(status)
                .provider("MANUAL")
                .providerTransactionId("tx-1")
                .paidAt(Instant.now())
                .build();
        payment.setId(id);
        return payment;
    }

    private TicketType createTicketType(String id, int quantity, int soldQuantity) {
        TicketType ticketType = TicketType.builder()
                .name("VIP")
                .price(BigDecimal.valueOf(500000))
                .quantity(quantity)
                .soldQuantity(soldQuantity)
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
