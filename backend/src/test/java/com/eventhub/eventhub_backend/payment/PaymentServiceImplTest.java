package com.eventhub.eventhub_backend.payment;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.payment.config.VNPayConfig;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.request.CreatePaymentUrlRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentUrlResponse;
import com.eventhub.eventhub_backend.payment.entity.Payment;
import com.eventhub.eventhub_backend.payment.entity.PaymentStatus;
import com.eventhub.eventhub_backend.payment.repository.PaymentRepository;
import com.eventhub.eventhub_backend.payment.service.Impl.PaymentServiceImpl;
import com.eventhub.eventhub_backend.notification.service.EmailService;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceImplTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final PaymentRepository paymentRepository = mock(PaymentRepository.class);
    private final TicketService ticketService = mock(TicketService.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final EmailService emailService = mock(EmailService.class);
    private final VNPayConfig vnpayConfig = new VNPayConfig();

    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vnpayConfig, "vnpTmnCode", "2QXUI4J4");
        ReflectionTestUtils.setField(vnpayConfig, "vnpHashSecret", "RAOCTRECEAXYZGTRJAHHAHNZGSGKTZXQ");
        ReflectionTestUtils.setField(vnpayConfig, "vnpPayUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        ReflectionTestUtils.setField(vnpayConfig, "vnpReturnUrl", "http://localhost:5173/payment/result");

        paymentService = new PaymentServiceImpl(
                bookingRepository,
                paymentRepository,
                ticketService,
                vnpayConfig,
                currentUserService,
                emailService
        );
    }

    @Test
    void confirmPayment_shouldConfirmPendingBookingWithoutChangingReservedInventory() {
        TicketType vip = createTicketType("ticket-type-1", 100, 27);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);
        ConfirmPaymentRequest request = createRequest("booking-1", "MANUAL", "tx-1");

        when(paymentRepository.findByProviderAndProviderTransactionId("MANUAL", "tx-1"))
                .thenReturn(Optional.empty());
        when(bookingRepository.findByIdForUpdate("booking-1")).thenReturn(Optional.of(booking));
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
        when(bookingRepository.findByIdForUpdate("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> paymentService.confirmPayment(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        assertThat(vip.getSoldQuantity()).isEqualTo(25);
        verify(bookingRepository, never()).save(booking);
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(ticketService, never()).issueTicketsForBooking(any(Booking.class));
    }

    @Test
    void createPaymentUrl_shouldGenerateValidVNPayUrl() {
        TicketType vip = createTicketType("ticket-type-1", 100, 25);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);
        CreatePaymentUrlRequest request = CreatePaymentUrlRequest.builder()
                .bookingId("booking-1")
                .bankCode("VNBANK")
                .build();

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);

        PaymentUrlResponse response = paymentService.createPaymentUrl(request, "192.168.1.1");

        assertThat(response).isNotNull();
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        assertThat(response.getProvider()).isEqualTo("VNPAY");
        assertThat(response.getPaymentUrl()).contains("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        assertThat(response.getPaymentUrl()).contains("vnp_Amount=100000000"); // 1,000,000 * 100
        assertThat(response.getPaymentUrl()).contains("vnp_SecureHash=");
    }

    @Test
    void processVNPayCallback_shouldConfirmWhenChecksumAndResponseCode00() {
        TicketType vip = createTicketType("ticket-type-1", 100, 25);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "100000000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "booking-1");
        params.put("vnp_TransactionNo", "14000123");

        String secureHash = vnpayConfig.hashAllFields(params);
        params.put("vnp_SecureHash", secureHash);

        when(bookingRepository.findByIdForUpdate("booking-1")).thenReturn(Optional.of(booking));
        when(paymentRepository.findByProviderAndProviderTransactionId("VNPAY", "14000123"))
                .thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId("pay-vnp-1");
            return p;
        });

        PaymentResponse response = paymentService.processVNPayCallback(params);

        assertThat(response).isNotNull();
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        verify(ticketService).issueTicketsForBooking(booking);
    }

    @Test
    void processVNPayCallback_shouldRejectWhenChecksumInvalid() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "100000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "booking-1");
        params.put("vnp_SecureHash", "invalid-hash-data");

        assertThatThrownBy(() -> paymentService.processVNPayCallback(params))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);
    }

    @Test
    void processVNPayIPN_shouldReturn00SuccessWhenValid() {
        TicketType vip = createTicketType("ticket-type-1", 100, 25);
        Booking booking = createBooking("booking-1", BookingStatus.PENDING_PAYMENT, vip, 2);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "100000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "booking-1");
        params.put("vnp_TransactionNo", "14000123");

        String secureHash = vnpayConfig.hashAllFields(params);
        params.put("vnp_SecureHash", secureHash);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.findByIdForUpdate("booking-1")).thenReturn(Optional.of(booking));
        when(paymentRepository.findByProviderAndProviderTransactionId("VNPAY", "14000123"))
                .thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> ipnResult = paymentService.processVNPayIPN(params);

        assertThat(ipnResult.get("RspCode")).isEqualTo("00");
        assertThat(ipnResult.get("Message")).isEqualTo("Confirm Success");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
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
