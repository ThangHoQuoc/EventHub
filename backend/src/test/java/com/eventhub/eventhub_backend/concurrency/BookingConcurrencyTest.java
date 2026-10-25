package com.eventhub.eventhub_backend.concurrency;

import com.eventhub.eventhub_backend.booking.entity.*;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.config.BookingScheduler;
import com.eventhub.eventhub_backend.config.EventScheduler;
import com.eventhub.eventhub_backend.config.WaitlistScheduler;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.service.PaymentService;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticketing.dto.request.CheckInTicketRequest;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import com.eventhub.eventhub_backend.user.entity.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Chạy trên PostgreSQL thử riêng; tuyệt đối không trỏ tới database ứng dụng.
 * Mỗi worker dùng connection/transaction độc lập. Transaction đầu giữ commit tới
 * khi PostgreSQL xác nhận transaction sau đang chờ khóa, thay vì dựa vào sleep.
 */
@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.datasource.driver-class-name=org.postgresql.Driver",
        "spring.datasource.hikari.maximum-pool-size=6",
        "spring.datasource.hikari.connection-init-sql=SET lock_timeout = '8s'",
        "jwt.secret=concurrency-test-only-not-a-real-secret-0123456789abcdef",
        "jwt.expiration=3600000"
})
@EnabledIfEnvironmentVariable(named = "EVENTHUB_CONCURRENCY_JDBC_URL", matches = ".+")
@Timeout(40)
class BookingConcurrencyTest {
    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        String url = System.getenv("EVENTHUB_CONCURRENCY_JDBC_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):\\d+/eventhub_concurrency[a-zA-Z0-9_]*")) {
            throw new IllegalArgumentException("Cần PostgreSQL localhost riêng tên eventhub_concurrency*; test dùng create-drop");
        }
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> System.getenv("EVENTHUB_CONCURRENCY_USERNAME"));
        registry.add("spring.datasource.password", () -> System.getenv("EVENTHUB_CONCURRENCY_PASSWORD"));
    }

    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired JdbcTemplate jdbc;
    @Autowired BookingService bookings;
    @Autowired PaymentService payments;
    @Autowired TicketService tickets;
    // Tắt tác vụ nền để chỉ các transaction do test điều khiển được chạy.
    @MockitoBean BookingScheduler bookingScheduler;
    @MockitoBean EventScheduler eventScheduler;
    @MockitoBean WaitlistScheduler waitlistScheduler;

    private TransactionTemplate tx;
    private String bookingId;
    private String otherBookingId;
    private String ticketTypeId;
    private String eventId;
    private String userId;
    private final Instant expiryCutoff = Instant.now().minusSeconds(60);

    @BeforeEach
    void fixture() {
        tx = new TransactionTemplate(transactionManager);
        tx.executeWithoutResult(status -> {
            User user = User.builder().email(UUID.randomUUID() + "@example.test")
                    .password("test-only-hash").fullName("Concurrency fixture")
                    .role(Role.CUSTOMER).status(Status.ACTIVE).build();
            em.persist(user);
            User organizer = user; // Chỉ kiểm tra quyền CUSTOMER/ADMIN trong các test này.
            Event event = Event.builder().title("Concurrency event").location("Test location")
                    .startAt(Instant.now().plusSeconds(3600)).endAt(Instant.now().plusSeconds(7200))
                    .status(EventStatus.PUBLISHED).organizer(organizer).build();
            em.persist(event);
            // 2 chỗ của booking đang test + 2 chỗ khác: double release phải bị phát hiện.
            TicketType type = TicketType.builder().name("Standard").price(BigDecimal.TEN)
                    .quantity(10).soldQuantity(4).event(event).build();
            em.persist(type);
            Booking booking = Booking.builder().customer(user).status(BookingStatus.PENDING_PAYMENT)
                    .totalAmount(new BigDecimal("20.00")).build();
            BookingItem item = BookingItem.builder().booking(booking).ticketType(type)
                    .quantity(2).unitPrice(BigDecimal.TEN).subtotal(new BigDecimal("20.00")).build();
            booking.setItems(List.of(item));
            em.persist(booking);
            em.flush();
            bookingId = booking.getId(); ticketTypeId = type.getId();
            eventId = event.getId(); userId = user.getId();
            em.createNativeQuery("update bookings set created_at = :created where id = :id")
                    .setParameter("created", expiryCutoff.minusSeconds(60))
                    .setParameter("id", bookingId).executeUpdate();
        });
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
        if (bookingId == null) return;
        tx.executeWithoutResult(status -> {
            if (otherBookingId != null) em.remove(em.find(Booking.class, otherBookingId));
            em.remove(em.find(Booking.class, bookingId));
            em.flush();
            em.remove(em.find(TicketType.class, ticketTypeId));
            em.flush();
            em.remove(em.find(Event.class, eventId));
            em.flush();
            em.remove(em.find(User.class, userId));
        });
    }

    @Test
    void simultaneousCancellationReleasesInventoryOnlyOnce() throws Exception {
        Race result = race(() -> bookings.cancelBooking(bookingId), () -> bookings.cancelBooking(bookingId));
        assertSuccess(result.first());
        assertInvalidRequest(result.second());
        assertState(BookingStatus.CANCELLED, 2, 0, 0);
    }

    @Test
    void simultaneousExpiryReleasesInventoryOnlyOnce() throws Exception {
        Race result = race(() -> bookings.expirePendingBookings(expiryCutoff),
                () -> bookings.expirePendingBookings(expiryCutoff));
        assertEquals(1, result.first().value());
        assertSuccess(result.second());
        assertEquals(0, result.second().value());
        assertState(BookingStatus.EXPIRED, 2, 0, 0);
    }

    @Test
    void committedCancellationMakesWaitingExpirySkipTheBooking() throws Exception {
        Race result = race(() -> bookings.cancelBooking(bookingId),
                () -> bookings.expirePendingBookings(expiryCutoff));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertEquals(0, result.second().value());
        assertState(BookingStatus.CANCELLED, 2, 0, 0);
    }

    @Test
    void committedExpiryMakesWaitingCancellationFailWithoutAnotherRelease() throws Exception {
        Race result = race(() -> bookings.expirePendingBookings(expiryCutoff),
                () -> bookings.cancelBooking(bookingId));
        assertSuccess(result.first()); assertEquals(1, result.first().value());
        assertInvalidRequest(result.second());
        assertState(BookingStatus.EXPIRED, 2, 0, 0);
    }

    @Test
    void differentBookingsSharingTicketTypeEachReleaseTheirOwnReservation() throws Exception {
        createOtherBooking();
        Race result = race(() -> bookings.cancelBooking(bookingId),
                () -> bookings.cancelBooking(otherBookingId));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertState(BookingStatus.CANCELLED, 0, 0, 0);
        tx.executeWithoutResult(status ->
                assertEquals(BookingStatus.CANCELLED, em.find(Booking.class, otherBookingId).getStatus()));
    }

    @Test
    void expiryBatchAggregatesReservationsFromBookingsSharingTicketType() {
        createOtherBooking();
        assertEquals(2, bookings.expirePendingBookings(expiryCutoff));
        assertState(BookingStatus.EXPIRED, 0, 0, 0);
        tx.executeWithoutResult(status ->
                assertEquals(BookingStatus.EXPIRED, em.find(Booking.class, otherBookingId).getStatus()));
    }

    @Test
    void failedTicketIssuanceRollsBackPaymentAndBookingConfirmation() {
        tx.executeWithoutResult(status ->
                em.find(Booking.class, bookingId).getItems().getFirst().setQuantity(0));
        AppException failure = assertThrows(AppException.class, () -> confirm("issuance-must-rollback"));
        assertEquals(ErrorCode.INVALID_REQUEST, failure.getErrorCode());
        assertState(BookingStatus.PENDING_PAYMENT, 4, 0, 0);
    }

    @Test
    void simultaneousPaymentReplayReturnsSamePaymentAndOneTicketSet() throws Exception {
        Race result = race(() -> confirm("same-reference"), () -> confirm("same-reference"));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertEquals(((PaymentResponse) result.first().value()).getId(),
                ((PaymentResponse) result.second().value()).getId());
        assertState(BookingStatus.CONFIRMED, 4, 1, 2);
    }

    @Test
    void differentPaymentReferencesCannotConfirmOneBookingTwice() throws Exception {
        Race result = race(() -> confirm("first-reference"), () -> confirm("other-reference"));
        assertSuccess(result.first()); assertInvalidRequest(result.second());
        assertState(BookingStatus.CONFIRMED, 4, 1, 2);
    }

    @Test
    void committedPaymentWinsAgainstWaitingCancellation() throws Exception {
        Race result = race(() -> confirm("payment-wins"), () -> bookings.cancelBooking(bookingId));
        assertSuccess(result.first()); assertInvalidRequest(result.second());
        assertState(BookingStatus.CONFIRMED, 4, 1, 2);
    }

    @Test
    void committedCancellationPreventsWaitingPaymentAndTicketIssuance() throws Exception {
        Race result = race(() -> bookings.cancelBooking(bookingId), () -> confirm("cancel-wins"));
        assertSuccess(result.first()); assertInvalidRequest(result.second());
        assertState(BookingStatus.CANCELLED, 2, 0, 0);
    }

    @Test
    void committedPaymentPreventsWaitingExpiryFromReleasingInventory() throws Exception {
        Race result = race(() -> confirm("payment-before-expiry"),
                () -> bookings.expirePendingBookings(expiryCutoff));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertEquals(0, result.second().value());
        assertState(BookingStatus.CONFIRMED, 4, 1, 2);
    }

    @Test
    void committedExpiryPreventsWaitingPaymentAndTicketIssuance() throws Exception {
        Race result = race(() -> bookings.expirePendingBookings(expiryCutoff), () -> confirm("expiry-wins"));
        assertEquals(1, result.first().value()); assertInvalidRequest(result.second());
        assertState(BookingStatus.EXPIRED, 2, 0, 0);
    }

    @Test
    void codeAndQrPayloadCannotCheckInSameTicketTwice() throws Exception {
        confirm("issue-before-checkin");
        String[] identifiers = tx.execute(status -> {
            Ticket ticket = em.createQuery("select t from Ticket t where t.booking.id = :id order by t.ticketCode", Ticket.class)
                    .setParameter("id", bookingId).getResultList().getFirst();
            return new String[]{ticket.getId(), ticket.getTicketCode(), ticket.getQrPayload()};
        });
        Race result = race(() -> checkIn(CheckInTicketRequest.builder().ticketCode(identifiers[1]).build()),
                () -> checkIn(CheckInTicketRequest.builder().qrPayload(identifiers[2]).build()));
        assertSuccess(result.first()); assertInvalidRequest(result.second());
        tx.executeWithoutResult(status -> {
            Ticket ticket = em.find(Ticket.class, identifiers[0]);
            assertEquals(TicketStatus.USED, ticket.getStatus());
            assertNotNull(ticket.getCheckedInAt());
        });
    }

    private void createOtherBooking() {
        tx.executeWithoutResult(status -> {
            Booking other = Booking.builder().customer(em.find(User.class, userId))
                    .status(BookingStatus.PENDING_PAYMENT).totalAmount(new BigDecimal("20.00")).build();
            other.setItems(List.of(BookingItem.builder().booking(other)
                    .ticketType(em.find(TicketType.class, ticketTypeId)).quantity(2)
                    .unitPrice(BigDecimal.TEN).subtotal(new BigDecimal("20.00")).build()));
            em.persist(other);
            em.flush();
            otherBookingId = other.getId();
            // Hai chỗ này đã được tính trong soldQuantity=4 của fixture ban đầu.
            em.createNativeQuery("update bookings set created_at = :created where id = :id")
                    .setParameter("created", expiryCutoff.minusSeconds(60))
                    .setParameter("id", otherBookingId).executeUpdate();
        });
    }

    private PaymentResponse confirm(String reference) {
        return payments.confirmPayment(ConfirmPaymentRequest.builder().bookingId(bookingId)
                .provider("TEST_ONLY").providerTransactionId(reference).build());
    }

    private Object checkIn(CheckInTicketRequest request) {
        authenticate(Role.ADMIN);
        return tickets.checkInTicket(request);
    }

    private void assertState(BookingStatus expectedStatus, int sold, long paymentCount, long ticketCount) {
        tx.executeWithoutResult(status -> {
            assertEquals(expectedStatus, em.find(Booking.class, bookingId).getStatus());
            assertEquals(sold, em.find(TicketType.class, ticketTypeId).getSoldQuantity());
            assertEquals(paymentCount, em.createQuery("select count(p) from Payment p where p.booking.id = :id", Long.class)
                    .setParameter("id", bookingId).getSingleResult());
            assertEquals(ticketCount, em.createQuery("select count(t) from Ticket t where t.booking.id = :id", Long.class)
                    .setParameter("id", bookingId).getSingleResult());
        });
    }

    private void authenticate(Role role) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))));
    }

    private Race race(Supplier<?> firstAction, Supplier<?> secondAction) throws Exception {
        ExecutorService workers = Executors.newFixedThreadPool(2);
        CountDownLatch firstFlushed = new CountDownLatch(1);
        CountDownLatch releaseCommit = new CountDownLatch(1);
        BlockingQueue<Integer> secondPid = new ArrayBlockingQueue<>(1);
        try {
            Future<Outcome> first = workers.submit(() -> execute(() -> {
                Object value = firstAction.get();
                em.flush();
                firstFlushed.countDown();
                await(releaseCommit);
                return value;
            }));
            assertTrue(firstFlushed.await(10, TimeUnit.SECONDS), "Transaction đầu chưa tới điểm giữ commit");
            Future<Outcome> second = workers.submit(() -> execute(() -> {
                secondPid.add(jdbc.queryForObject("select pg_backend_pid()", Integer.class));
                return secondAction.get();
            }));
            Integer pid = secondPid.poll(5, TimeUnit.SECONDS);
            assertNotNull(pid, "Transaction sau chưa lấy được connection");
            awaitDatabaseLock(pid, second);
            releaseCommit.countDown();
            return new Race(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));
        } finally {
            releaseCommit.countDown();
            workers.shutdownNow();
            assertTrue(workers.awaitTermination(10, TimeUnit.SECONDS), "Worker chưa kết thúc");
        }
    }

    private Outcome execute(Supplier<?> action) {
        authenticate(Role.CUSTOMER);
        try {
            return new Outcome(tx.execute(status -> action.get()), null);
        } catch (RuntimeException failure) {
            return new Outcome(null, failure);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private void awaitDatabaseLock(int pid, Future<Outcome> worker) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline) {
            Boolean waiting = jdbc.queryForObject("select coalesce(wait_event_type = 'Lock', false) from pg_stat_activity where pid = ?",
                    Boolean.class, pid);
            if (Boolean.TRUE.equals(waiting)) return;
            if (worker.isDone()) fail("Transaction sau kết thúc trước khi chờ khóa: " + worker.get());
            // Poll trạng thái khóa thật; khoảng nghỉ không quyết định thứ tự transaction.
            Thread.sleep(20);
        }
        fail("PostgreSQL không quan sát thấy transaction sau chờ khóa trong 5 giây");
    }

    private static void await(CountDownLatch latch) {
        try {
            if (!latch.await(15, TimeUnit.SECONDS)) throw new IllegalStateException("Quá hạn giữ commit");
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(interrupted);
        }
    }

    private static void assertSuccess(Outcome outcome) {
        assertNull(outcome.failure(), () -> "Gọi service thất bại: " + outcome.failure());
    }

    private static void assertInvalidRequest(Outcome outcome) {
        AppException failure = assertInstanceOf(AppException.class, outcome.failure());
        assertEquals(ErrorCode.INVALID_REQUEST, failure.getErrorCode());
    }

    private record Outcome(Object value, RuntimeException failure) {}
    private record Race(Outcome first, Outcome second) {}
}
