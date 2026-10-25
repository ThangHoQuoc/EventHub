package com.eventhub.eventhub_backend.concurrency;

import com.eventhub.eventhub_backend.booking.entity.*;
import com.eventhub.eventhub_backend.booking.dto.request.BookingItemRequest;
import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.config.BookingScheduler;
import com.eventhub.eventhub_backend.config.EventScheduler;
import com.eventhub.eventhub_backend.config.WaitlistScheduler;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.user.entity.*;
import com.eventhub.eventhub_backend.waitlist.dto.request.JoinWaitlistRequest;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import com.eventhub.eventhub_backend.waitlist.entity.*;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistService;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
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

/** PostgreSQL thử riêng, transaction thật và quan sát lock waiter thay vì đoán thứ tự bằng sleep. */
@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.show-sql=false",
        "spring.datasource.driver-class-name=org.postgresql.Driver",
        "spring.datasource.hikari.maximum-pool-size=6",
        "spring.datasource.hikari.connection-init-sql=SET lock_timeout = '8s'",
        "jwt.secret=concurrency-test-only-not-a-real-secret-0123456789abcdef", "jwt.expiration=3600000"
})
@EnabledIfEnvironmentVariable(named = "EVENTHUB_CONCURRENCY_JDBC_URL", matches = ".+")
@Timeout(40)
class WaitlistConcurrencyTest {
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
    @Autowired WaitlistService waitlist;
    @Autowired WaitlistOfferService offers;
    @Autowired BookingService bookings;
    @Autowired WaitlistEntryRepository entryRepository;
    @MockitoBean BookingScheduler bookingScheduler;
    @MockitoBean EventScheduler eventScheduler;
    @MockitoBean WaitlistScheduler waitlistScheduler;

    private TransactionTemplate tx;
    private String userId;
    private String otherUserId;
    private String eventId;
    private String typeId;
    private final Instant expiry = Instant.now().plusSeconds(3600);

    @BeforeEach
    void fixture() {
        tx = new TransactionTemplate(transactionManager);
        tx.executeWithoutResult(status -> {
            User user = user(); User other = user(); em.persist(user); em.persist(other);
            Event event = Event.builder().title("Waitlist concurrency fixture").location("Test")
                    .startAt(Instant.now().plusSeconds(7200)).endAt(Instant.now().plusSeconds(10800))
                    .status(EventStatus.PUBLISHED).organizer(user).build();
            em.persist(event);
            TicketType type = TicketType.builder().name("Standard").price(BigDecimal.TEN)
                    .quantity(10).soldQuantity(6).event(event).build();
            em.persist(type); em.flush();
            userId = user.getId(); otherUserId = other.getId(); eventId = event.getId(); typeId = type.getId();
        });
        authenticate(userId);
    }

    private User user() {
        return User.builder().email(UUID.randomUUID() + "@example.test").password("fixture-only-hash")
                .fullName("Waitlist fixture").role(Role.CUSTOMER).status(Status.ACTIVE).build();
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
        if (typeId == null) return;
        tx.executeWithoutResult(status -> {
            em.createQuery("delete from WaitlistOffer o where o.ticketType.id = :id").setParameter("id", typeId).executeUpdate();
            em.createQuery("delete from WaitlistEntry e where e.ticketType.id = :id").setParameter("id", typeId).executeUpdate();
            em.createQuery("delete from Ticket t where t.ticketType.id = :id").setParameter("id", typeId).executeUpdate();
            em.createQuery("delete from Payment p where p.booking.customer.id in :ids")
                    .setParameter("ids", List.of(userId, otherUserId)).executeUpdate();
            em.createQuery("delete from BookingItem i where i.ticketType.id = :id").setParameter("id", typeId).executeUpdate();
            em.createQuery("delete from Booking b where b.customer.id in :ids")
                    .setParameter("ids", List.of(userId, otherUserId)).executeUpdate();
            em.remove(em.find(TicketType.class, typeId)); em.flush();
            em.remove(em.find(Event.class, eventId)); em.flush();
            em.remove(em.find(User.class, userId)); em.remove(em.find(User.class, otherUserId));
        });
    }

    @Test
    void duplicateConcurrentJoinCreatesOneActiveEntry() throws Exception {
        inventory(10);
        JoinWaitlistRequest request = JoinWaitlistRequest.builder().quantity(1).build();
        Race result = race(() -> {
            Object response = waitlist.joinWaitlist(typeId, request);
            // Với implementation cũ, tx2 đọc exists=false rồi chờ khóa FK khi insert.
            // Với implementation đã sửa, tx2 phải chờ khóa trước kiểm tra trùng.
            em.lock(em.find(User.class, userId), LockModeType.PESSIMISTIC_WRITE);
            return response;
        }, () -> waitlist.joinWaitlist(typeId, request));
        assertSuccess(result.first()); assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertEquals(1, count("WaitlistEntry"));
    }

    @Test
    void competingDispatchDoesNotDuplicateOfferOrExceedAvailableBudget() throws Exception {
        inventory(9);
        waiting(userId, 1, Instant.now().minusSeconds(120));
        waiting(otherUserId, 1, Instant.now().minusSeconds(60));
        Race result = race(() -> offers.offerNextEligibleEntry(typeId, expiry),
                () -> offers.offerNextEligibleEntry(typeId, expiry));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertEquals(1, count("WaitlistOffer"));
        long offeredCount = tx.execute(status -> em.createQuery(
                "select count(e) from WaitlistEntry e where e.ticketType.id = :id and e.status = :status", Long.class)
                .setParameter("id", typeId).setParameter("status", WaitlistEntryStatus.OFFERED).getSingleResult());
        assertEquals(1L, offeredCount);
        assertSold(9); // Offer chỉ thông báo, không giữ tồn kho.
    }

    @Test
    void concurrentAcceptReturnsSameBookingAndReservesOnlyOnce() throws Exception {
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.acceptOffer(offerId), () -> offers.acceptOffer(offerId));
        assertSuccess(result.first()); assertSuccess(result.second());
        assertEquals(((WaitlistOfferResponse) result.first().value()).getBookingId(),
                ((WaitlistOfferResponse) result.second().value()).getBookingId());
        assertEquals(1, count("Booking")); assertSold(7);
        assertOffer(offerId, WaitlistOfferStatus.CONVERTED_TO_BOOKING, WaitlistEntryStatus.CONVERTED);
    }

    @Test
    void committedSkipRejectsWaitingAcceptWithoutCreatingBooking() throws Exception {
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.skipOffer(offerId), () -> offers.acceptOffer(offerId));
        assertSuccess(result.first()); assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertEquals(0, count("Booking")); assertSold(6);
        assertOffer(offerId, WaitlistOfferStatus.SKIPPED, WaitlistEntryStatus.SKIPPED);
    }

    @Test
    void committedAcceptRejectsWaitingSkipWithoutOverwritingConversion() throws Exception {
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.acceptOffer(offerId), () -> offers.skipOffer(offerId));
        assertSuccess(result.first()); assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertEquals(1, count("Booking")); assertSold(7);
        assertOffer(offerId, WaitlistOfferStatus.CONVERTED_TO_BOOKING, WaitlistEntryStatus.CONVERTED);
    }

    @Test
    void committedExpiryRejectsWaitingAcceptWithoutCreatingBooking() throws Exception {
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.expireCreatedOffers(expiry.plusSeconds(1)), () -> offers.acceptOffer(offerId));
        assertSuccess(result.first()); assertEquals(1, result.first().value());
        assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertEquals(0, count("Booking")); assertSold(6);
        assertOffer(offerId, WaitlistOfferStatus.EXPIRED, WaitlistEntryStatus.EXPIRED);
    }

    @Test
    void committedAcceptMakesWaitingExpirySkipConvertedOffer() throws Exception {
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.acceptOffer(offerId), () -> offers.expireCreatedOffers(expiry.plusSeconds(1)));
        assertSuccess(result.first()); assertSuccess(result.second()); assertEquals(0, result.second().value());
        assertEquals(1, count("Booking")); assertSold(7);
        assertOffer(offerId, WaitlistOfferStatus.CONVERTED_TO_BOOKING, WaitlistEntryStatus.CONVERTED);
    }

    @Test
    void expiredAcceptCommitsExpiryEvenThoughServiceThrowsInvalidRequest() {
        String offerId = offered(userId, 1, Instant.now().minusSeconds(1));
        // Không bọc outer tx: kiểm tra đúng transaction boundary của service proxy.
        AppException failure = assertThrows(AppException.class, () -> offers.acceptOffer(offerId));
        assertEquals(ErrorCode.INVALID_REQUEST, failure.getErrorCode());
        assertOffer(offerId, WaitlistOfferStatus.EXPIRED, WaitlistEntryStatus.EXPIRED);
        assertEquals(0, count("Booking")); assertSold(6);
    }

    @Test
    void expiryIncludesExactCutoffBoundary() {
        // Dùng mốc tròn giây để PostgreSQL và Java không khác precision tại biên.
        Instant cutoff = Instant.parse("2026-01-01T00:00:00Z");
        String offerId = offered(userId, 1, cutoff);
        assertEquals(1, offers.expireCreatedOffers(cutoff));
        assertOffer(offerId, WaitlistOfferStatus.EXPIRED, WaitlistEntryStatus.EXPIRED);
        assertEquals(0, offers.expireCreatedOffers(cutoff));
        assertEquals(0, count("Booking")); assertSold(6);
    }

    @Test
    void insufficientInventoryRollsBackAcceptAndKeepsOfferAvailableForRetry() {
        String offerId = offered(userId, 1, expiry);
        inventory(10);
        AppException failure = assertThrows(AppException.class, () -> offers.acceptOffer(offerId));
        assertEquals(ErrorCode.INVALID_REQUEST, failure.getErrorCode());
        assertOffer(offerId, WaitlistOfferStatus.CREATED, WaitlistEntryStatus.OFFERED);
        assertEquals(0, count("Booking")); assertSold(10);
    }

    @Test
    void wrongOwnerCannotMutateAnExpiredOffer() {
        String offerId = offered(userId, 1, Instant.now().minusSeconds(1));
        authenticate(otherUserId);
        AppException failure = assertThrows(AppException.class, () -> offers.acceptOffer(offerId));
        assertEquals(ErrorCode.UNAUTHORIZED, failure.getErrorCode());
        assertOffer(offerId, WaitlistOfferStatus.CREATED, WaitlistEntryStatus.OFFERED);
        assertEquals(0, count("Booking")); assertSold(6);
    }

    @Test
    void cancelledBookingAutomaticallyOffersReleasedSeatsAfterCommitWithFifteenMinuteTtl() {
        inventory(10);
        String bookingId = pendingBooking(2);
        String entryId = waiting(otherUserId, 2, Instant.now().minusSeconds(60));
        Instant before = Instant.now();
        bookings.cancelBooking(bookingId);
        Instant after = Instant.now();
        assertSold(8);
        List<WaitlistOffer> generated = activeOffers();
        assertEquals(1, generated.size());
        WaitlistOffer offer = generated.getFirst();
        assertEquals(entryId, offer.getWaitlistEntry().getId());
        assertEquals(2, offer.getQuantity());
        assertTrue(!offer.getExpiresAt().isBefore(before.plusSeconds(899))
                && !offer.getExpiresAt().isAfter(after.plusSeconds(901)), "Offer tự động có TTL 15 phút");
    }

    @Test
    void expiredBookingAutomaticallyOffersReleasedSeatsWithoutSchedulerInvocation() {
        inventory(10);
        pendingBooking(2);
        String entryId = waiting(otherUserId, 2, Instant.now().minusSeconds(60));
        assertEquals(1, bookings.expirePendingBookings(Instant.now().minusSeconds(900)));
        assertSold(8);
        List<WaitlistOffer> generated = activeOffers();
        assertEquals(1, generated.size()); assertEquals(entryId, generated.getFirst().getWaitlistEntry().getId());
    }

    @Test
    void releasingTwoSeatsNotifiesBothWaitingCustomersWithoutExceedingOfferBudget() {
        inventory(10);
        String bookingId = pendingBooking(2);
        String firstEntry = waiting(userId, 1, Instant.now().minusSeconds(120));
        String nextEntry = waiting(otherUserId, 1, Instant.now().minusSeconds(60));
        bookings.cancelBooking(bookingId);
        List<WaitlistOffer> generated = activeOffers();
        assertEquals(2, generated.size());
        assertEquals(List.of(firstEntry, nextEntry).stream().sorted().toList(), generated.stream()
                .map(offer -> offer.getWaitlistEntry().getId()).sorted().toList());
        assertEquals(List.of(userId, otherUserId).stream().sorted().toList(), generated.stream()
                .map(offer -> offer.getWaitlistEntry().getCustomer().getId()).sorted().toList());
        assertTrue(generated.stream().allMatch(offer -> offer.getQuantity() == 1));
        assertEquals(2, generated.stream().mapToInt(WaitlistOffer::getQuantity).sum());
        assertSold(8); // Hai offer dùng hết ngân sách thông báo 2 chỗ, không giữ thêm tồn kho.
        assertEquals(0, offers.offerAvailableEntries(typeId));
        assertTrue(offers.offerNextEligibleEntry(typeId, expiry).isEmpty());
        assertEquals(2, count("WaitlistOffer")); assertSold(8);
    }

    @Test
    void rolledBackCancellationNeverCreatesAnOfferOrReleasesInventory() {
        inventory(10);
        String bookingId = pendingBooking(2);
        waiting(otherUserId, 2, Instant.now().minusSeconds(60));
        tx.executeWithoutResult(status -> {
            bookings.cancelBooking(bookingId);
            em.flush();
            assertEquals(0L, em.createQuery("select count(o) from WaitlistOffer o where o.ticketType.id = :id", Long.class)
                    .setParameter("id", typeId).getSingleResult());
            status.setRollbackOnly();
        });
        assertEquals(0, count("WaitlistOffer")); assertSold(10);
        assertEquals(BookingStatus.PENDING_PAYMENT, tx.execute(status -> em.find(Booking.class, bookingId).getStatus()));
    }

    @Test
    void skipAutomaticallyPassesOfferBudgetToNextWaitingCustomer() {
        String offerId = offered(userId, 1, expiry);
        String nextId = waiting(otherUserId, 1, Instant.now().minusSeconds(30));
        offers.skipOffer(offerId);
        assertOffer(offerId, WaitlistOfferStatus.SKIPPED, WaitlistEntryStatus.SKIPPED);
        List<WaitlistOffer> next = activeOffers();
        assertEquals(1, next.size()); assertEquals(nextId, next.getFirst().getWaitlistEntry().getId());
        assertSold(6);
    }

    @Test
    void expiryAutomaticallyPassesOfferBudgetToNextWaitingCustomer() {
        String offerId = offered(userId, 1, Instant.now().minusSeconds(1));
        String nextId = waiting(otherUserId, 1, Instant.now().minusSeconds(30));
        assertEquals(1, offers.expireCreatedOffers(Instant.now()));
        assertOffer(offerId, WaitlistOfferStatus.EXPIRED, WaitlistEntryStatus.EXPIRED);
        List<WaitlistOffer> next = activeOffers();
        assertEquals(1, next.size()); assertEquals(nextId, next.getFirst().getWaitlistEntry().getId());
        assertSold(6);
    }

    @Test
    void expiredAcceptCommitsExpiryAndOffersToNextWaitingCustomer() {
        String offerId = offered(userId, 1, Instant.now().minusSeconds(1));
        String nextId = waiting(otherUserId, 1, Instant.now().minusSeconds(30));
        assertThrows(AppException.class, () -> offers.acceptOffer(offerId));
        assertOffer(offerId, WaitlistOfferStatus.EXPIRED, WaitlistEntryStatus.EXPIRED);
        List<WaitlistOffer> next = activeOffers();
        assertEquals(1, next.size()); assertEquals(nextId, next.getFirst().getWaitlistEntry().getId());
    }

    @Test
    void dispatcherSelectsOldestEligibleEntryAndLeavesOversizedEntryWaiting() {
        inventory(8);
        String oversized = waiting(userId, 3, Instant.now().minusSeconds(120));
        String eligible = waiting(otherUserId, 2, Instant.now().minusSeconds(60));
        WaitlistOfferResponse offer = offers.offerNextEligibleEntry(typeId, expiry).orElseThrow();
        assertEquals(eligible, offer.getWaitlistEntryId());
        assertEquals(WaitlistEntryStatus.WAITING, tx.execute(status -> em.find(WaitlistEntry.class, oversized).getStatus()));
        assertSold(8);
    }

    @Test
    void equalCreatedTimesAreOrderedByIdForDeterministicEligibility() {
        inventory(9);
        Instant sameCreatedAt = Instant.now().minusSeconds(120);
        String first = waiting(userId, 1, sameCreatedAt);
        String second = waiting(otherUserId, 1, sameCreatedAt);
        String higherId = "z-" + UUID.randomUUID();
        String lowerId = "a-" + UUID.randomUUID();
        tx.executeWithoutResult(status -> {
            em.createNativeQuery("update waitlist_entries set id = :newId where id = :oldId")
                    .setParameter("newId", higherId).setParameter("oldId", first).executeUpdate();
            em.createNativeQuery("update waitlist_entries set id = :newId where id = :oldId")
                    .setParameter("newId", lowerId).setParameter("oldId", second).executeUpdate();
        });
        assertEquals(lowerId, offers.offerNextEligibleEntry(typeId, expiry).orElseThrow().getWaitlistEntryId());
    }

    @Test
    void activeOffersConsumeNotificationBudgetWithoutReservingInventory() {
        waiting(userId, 4, Instant.now().minusSeconds(120));
        waiting(otherUserId, 1, Instant.now().minusSeconds(60));
        assertTrue(offers.offerNextEligibleEntry(typeId, expiry).isPresent());
        assertTrue(offers.offerNextEligibleEntry(typeId, expiry).isEmpty());
        assertEquals(1, count("WaitlistOffer")); assertSold(6);
    }

    @Test
    void manualOfferCannotExceedAvailableInventoryOrActiveOfferBudget() {
        String first = waiting(userId, 4, Instant.now().minusSeconds(120));
        String next = waiting(otherUserId, 1, Instant.now().minusSeconds(60));
        offers.createOffer(CreateWaitlistOfferRequest.builder().waitlistEntryId(first).quantity(4).expiresAt(expiry).build());
        AppException failure = assertThrows(AppException.class, () -> offers.createOffer(CreateWaitlistOfferRequest.builder()
                .waitlistEntryId(next).quantity(1).expiresAt(expiry).build()));
        assertEquals(ErrorCode.INVALID_REQUEST, failure.getErrorCode());
        assertEquals(1, count("WaitlistOffer")); assertSold(6);
    }

    @Test
    void unpublishedEventNeverReceivesAnOffer() {
        waiting(userId, 1, Instant.now().minusSeconds(60));
        tx.executeWithoutResult(status -> em.find(Event.class, eventId).setStatus(EventStatus.CANCELLED));
        assertTrue(offers.offerNextEligibleEntry(typeId, expiry).isEmpty());
        assertEquals(0, count("WaitlistOffer")); assertSold(6);
    }

    @Test
    void acceptedOfferWinsLastSeatAgainstOrdinaryBookingWithoutOverselling() throws Exception {
        inventory(9);
        String offerId = offered(userId, 1, expiry);
        Race result = race(() -> offers.acceptOffer(offerId), this::ordinaryBooking);
        assertSuccess(result.first()); assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertOffer(offerId, WaitlistOfferStatus.CONVERTED_TO_BOOKING, WaitlistEntryStatus.CONVERTED);
        assertEquals(1, count("Booking")); assertSold(10);
    }

    @Test
    void ordinaryBookingCanWinLastSeatAndFailedAcceptKeepsOfferForRetry() throws Exception {
        inventory(9);
        String offerId = offered(userId, 1, expiry);
        Race result = race(this::ordinaryBooking, () -> offers.acceptOffer(offerId));
        assertSuccess(result.first()); assertFailure(result.second(), ErrorCode.INVALID_REQUEST);
        assertOffer(offerId, WaitlistOfferStatus.CREATED, WaitlistEntryStatus.OFFERED);
        assertEquals(1, count("Booking")); assertSold(10);
    }

    @Test
    void schedulerRecoversAvailableSeatsAfterMissedReleaseEventWithoutDuplicateOffers() {
        inventory(10);
        String entryId = waiting(userId, 1, Instant.now().minusSeconds(60));
        inventory(9); // Giả lập chỗ đã trả nhưng sự kiện sau commit bị bỏ lỡ khi tiến trình dừng.
        WaitlistScheduler recoveryJob = new WaitlistScheduler(offers, entryRepository);
        recoveryJob.expireCreatedWaitlistOffers();
        List<WaitlistOffer> generated = activeOffers();
        assertEquals(1, generated.size()); assertEquals(entryId, generated.getFirst().getWaitlistEntry().getId());
        recoveryJob.expireCreatedWaitlistOffers();
        assertEquals(1, count("WaitlistOffer")); assertSold(9);
    }

    private Object ordinaryBooking() {
        return bookings.createBooking(CreateBookingRequest.builder().items(List.of(
                BookingItemRequest.builder().ticketTypeId(typeId).quantity(1).build())).build());
    }

    private String pendingBooking(int quantity) {
        return tx.execute(status -> {
            Booking booking = Booking.builder().customer(em.find(User.class, userId))
                    .status(BookingStatus.PENDING_PAYMENT).totalAmount(BigDecimal.TEN.multiply(BigDecimal.valueOf(quantity))).build();
            booking.setItems(List.of(BookingItem.builder().booking(booking).ticketType(em.find(TicketType.class, typeId))
                    .quantity(quantity).unitPrice(BigDecimal.TEN).subtotal(booking.getTotalAmount()).build()));
            em.persist(booking); em.flush();
            em.createNativeQuery("update bookings set created_at = :created where id = :id")
                    .setParameter("created", Instant.now().minusSeconds(1800)).setParameter("id", booking.getId()).executeUpdate();
            return booking.getId();
        });
    }

    private List<WaitlistOffer> activeOffers() {
        return tx.execute(status -> em.createQuery("select o from WaitlistOffer o join fetch o.waitlistEntry "
                        + "where o.ticketType.id = :id and o.status = :status", WaitlistOffer.class)
                .setParameter("id", typeId).setParameter("status", WaitlistOfferStatus.CREATED).getResultList());
    }

    private void inventory(int sold) {
        tx.executeWithoutResult(status -> em.find(TicketType.class, typeId).setSoldQuantity(sold));
    }

    private String waiting(String customerId, int quantity, Instant createdAt) {
        return tx.execute(status -> {
            WaitlistEntry entry = WaitlistEntry.builder().customer(em.find(User.class, customerId))
                    .ticketType(em.find(TicketType.class, typeId)).quantity(quantity).status(WaitlistEntryStatus.WAITING).build();
            em.persist(entry); em.flush();
            em.createNativeQuery("update waitlist_entries set created_at = :created where id = :id")
                    .setParameter("created", createdAt).setParameter("id", entry.getId()).executeUpdate();
            return entry.getId();
        });
    }

    private String offered(String customerId, int quantity, Instant expiresAt) {
        String entryId = waiting(customerId, quantity, Instant.now().minusSeconds(60));
        return tx.execute(status -> {
            WaitlistEntry entry = em.find(WaitlistEntry.class, entryId); entry.setStatus(WaitlistEntryStatus.OFFERED);
            WaitlistOffer offer = WaitlistOffer.builder().waitlistEntry(entry).ticketType(entry.getTicketType())
                    .quantity(quantity).status(WaitlistOfferStatus.CREATED).expiresAt(expiresAt).build();
            em.persist(offer); em.flush(); return offer.getId();
        });
    }

    private long count(String entity) {
        return tx.execute(status -> switch (entity) {
            case "Booking" -> em.createQuery("select count(b) from Booking b where b.customer.id in :ids", Long.class)
                    .setParameter("ids", List.of(userId, otherUserId)).getSingleResult();
            case "WaitlistEntry" -> em.createQuery("select count(e) from WaitlistEntry e where e.ticketType.id = :id", Long.class)
                    .setParameter("id", typeId).getSingleResult();
            case "WaitlistOffer" -> em.createQuery("select count(o) from WaitlistOffer o where o.ticketType.id = :id", Long.class)
                    .setParameter("id", typeId).getSingleResult();
            default -> throw new IllegalArgumentException(entity);
        });
    }

    private void assertOffer(String id, WaitlistOfferStatus offerStatus, WaitlistEntryStatus entryStatus) {
        tx.executeWithoutResult(status -> {
            WaitlistOffer offer = em.find(WaitlistOffer.class, id);
            assertEquals(offerStatus, offer.getStatus()); assertEquals(entryStatus, offer.getWaitlistEntry().getStatus());
            if (offerStatus == WaitlistOfferStatus.CONVERTED_TO_BOOKING) {
                assertNotNull(offer.getConvertedBookingId()); assertNotNull(offer.getAcceptedAt());
            }
        });
    }

    private void assertSold(int expected) {
        int sold = tx.execute(status -> em.find(TicketType.class, typeId).getSoldQuantity());
        assertEquals(expected, sold);
    }

    private void authenticate(String customerId) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                customerId, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
    }

    private Race race(Supplier<?> firstAction, Supplier<?> secondAction) throws Exception {
        ExecutorService workers = Executors.newFixedThreadPool(2);
        CountDownLatch firstFlushed = new CountDownLatch(1);
        CountDownLatch releaseCommit = new CountDownLatch(1);
        BlockingQueue<Integer> secondPid = new ArrayBlockingQueue<>(1);
        try {
            Future<Outcome> first = workers.submit(() -> execute(() -> {
                Object value = firstAction.get(); em.flush(); firstFlushed.countDown(); await(releaseCommit); return value;
            }));
            assertTrue(firstFlushed.await(10, TimeUnit.SECONDS), "Transaction đầu chưa tới điểm giữ commit");
            Future<Outcome> second = workers.submit(() -> execute(() -> {
                secondPid.add(jdbc.queryForObject("select pg_backend_pid()", Integer.class)); return secondAction.get();
            }));
            Integer pid = secondPid.poll(5, TimeUnit.SECONDS); assertNotNull(pid);
            awaitDatabaseLock(pid, second); releaseCommit.countDown();
            return new Race(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));
        } finally {
            releaseCommit.countDown(); workers.shutdownNow();
            assertTrue(workers.awaitTermination(10, TimeUnit.SECONDS), "Worker chưa kết thúc");
        }
    }

    private Outcome execute(Supplier<?> action) {
        authenticate(userId);
        try { return new Outcome(tx.execute(status -> action.get()), null); }
        catch (RuntimeException failure) { return new Outcome(null, failure); }
        finally { SecurityContextHolder.clearContext(); }
    }

    private void awaitDatabaseLock(int pid, Future<Outcome> worker) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline) {
            Boolean waiting = jdbc.queryForObject("select coalesce(wait_event_type = 'Lock', false) from pg_stat_activity where pid = ?",
                    Boolean.class, pid);
            if (Boolean.TRUE.equals(waiting)) return;
            if (worker.isDone()) fail("Transaction sau kết thúc trước khi chờ khóa: " + worker.get());
            Thread.sleep(20); // Poll quan sát khóa thật; không quyết định thứ tự transaction.
        }
        fail("Không thấy PostgreSQL lock waiter trong 5 giây");
    }

    private static void await(CountDownLatch latch) {
        try { if (!latch.await(15, TimeUnit.SECONDS)) throw new IllegalStateException("Quá hạn giữ commit"); }
        catch (InterruptedException failure) { Thread.currentThread().interrupt(); throw new IllegalStateException(failure); }
    }

    private static void assertSuccess(Outcome outcome) {
        assertNull(outcome.failure(), () -> "Service thất bại: " + outcome.failure());
    }

    private static void assertFailure(Outcome outcome, ErrorCode expected) {
        AppException failure = assertInstanceOf(AppException.class, outcome.failure()); assertEquals(expected, failure.getErrorCode());
    }

    private record Outcome(Object value, RuntimeException failure) {}
    private record Race(Outcome first, Outcome second) {}
}
