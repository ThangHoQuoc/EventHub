package com.eventhub.eventhub_backend.waitlist;

import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.waitlist.dto.request.CreateWaitlistOfferRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistOfferResponse;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistOfferRepository;
import com.eventhub.eventhub_backend.waitlist.service.Impl.WaitlistOfferServiceImpl;
import com.eventhub.eventhub_backend.notification.service.EmailService;
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

class WaitlistOfferServiceImplTest {

    private final WaitlistEntryRepository waitlistEntryRepository = mock(WaitlistEntryRepository.class);
    private final WaitlistOfferRepository waitlistOfferRepository = mock(WaitlistOfferRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final BookingService bookingService = mock(BookingService.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final EmailService emailService = mock(EmailService.class);

    private final WaitlistOfferServiceImpl waitlistOfferService = new WaitlistOfferServiceImpl(
            waitlistEntryRepository,
            waitlistOfferRepository,
            ticketTypeRepository,
            bookingService,
            currentUserService,
            mock(org.springframework.context.ApplicationEventPublisher.class),
            emailService
    );

    @Test
    void createOffer_shouldCreateOfferAndMarkEntryOffered() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 2, WaitlistEntryStatus.WAITING);
        Instant expiresAt = Instant.now().plusSeconds(900);
        CreateWaitlistOfferRequest request = CreateWaitlistOfferRequest.builder()
                .waitlistEntryId("waitlist-entry-1")
                .quantity(2)
                .expiresAt(expiresAt)
                .build();

        stubEntry(entry);
        when(waitlistOfferRepository.existsByWaitlistEntryIdAndStatus(
                "waitlist-entry-1",
                WaitlistOfferStatus.CREATED
        )).thenReturn(false);
        when(waitlistOfferRepository.save(any(WaitlistOffer.class))).thenAnswer(invocation -> {
            WaitlistOffer offer = invocation.getArgument(0);
            offer.setId("waitlist-offer-1");
            return offer;
        });

        WaitlistOfferResponse response = waitlistOfferService.createOffer(request);

        assertThat(response.getId()).isEqualTo("waitlist-offer-1");
        assertThat(response.getWaitlistEntryId()).isEqualTo("waitlist-entry-1");
        assertThat(response.getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getTicketTypeId()).isEqualTo("ticket-type-1");
        assertThat(response.getQuantity()).isEqualTo(2);
        assertThat(response.getStatus()).isEqualTo(WaitlistOfferStatus.CREATED);
        assertThat(response.getExpiresAt()).isEqualTo(expiresAt);
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.OFFERED);
        verify(waitlistEntryRepository).save(entry);
        verify(waitlistOfferRepository).save(any(WaitlistOffer.class));
    }

    @Test
    void createOffer_shouldRejectNonWaitingEntry() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        CreateWaitlistOfferRequest request = CreateWaitlistOfferRequest.builder()
                .waitlistEntryId("waitlist-entry-1")
                .quantity(1)
                .expiresAt(Instant.now().plusSeconds(900))
                .build();

        stubEntry(entry);

        assertThatThrownBy(() -> waitlistOfferService.createOffer(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistOfferRepository, never()).save(any(WaitlistOffer.class));
    }

    @Test
    void createOffer_shouldRejectDuplicateCreatedOffer() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.WAITING);
        CreateWaitlistOfferRequest request = CreateWaitlistOfferRequest.builder()
                .waitlistEntryId("waitlist-entry-1")
                .quantity(1)
                .expiresAt(Instant.now().plusSeconds(900))
                .build();

        stubEntry(entry);
        when(waitlistOfferRepository.existsByWaitlistEntryIdAndStatus(
                "waitlist-entry-1",
                WaitlistOfferStatus.CREATED
        )).thenReturn(true);

        assertThatThrownBy(() -> waitlistOfferService.createOffer(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistOfferRepository, never()).save(any(WaitlistOffer.class));
    }

    @Test
    void createOffer_shouldRejectExpiresAtInPast() {
        CreateWaitlistOfferRequest request = CreateWaitlistOfferRequest.builder()
                .waitlistEntryId("waitlist-entry-1")
                .quantity(1)
                .expiresAt(Instant.now().minusSeconds(60))
                .build();

        assertThatThrownBy(() -> waitlistOfferService.createOffer(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistEntryRepository, never()).findById("waitlist-entry-1");
    }

    @Test
    void createOffer_shouldRejectQuantityGreaterThanRequestedQuantity() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.WAITING);
        CreateWaitlistOfferRequest request = CreateWaitlistOfferRequest.builder()
                .waitlistEntryId("waitlist-entry-1")
                .quantity(2)
                .expiresAt(Instant.now().plusSeconds(900))
                .build();

        stubEntry(entry);

        assertThatThrownBy(() -> waitlistOfferService.createOffer(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistOfferRepository, never()).save(any(WaitlistOffer.class));
    }

    @Test
    void getMyOffers_shouldReturnCurrentCustomerOffers() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);
        PageRequest pageable = PageRequest.of(0, 10);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(waitlistOfferRepository.findByWaitlistEntryCustomerId("customer-1", pageable))
                .thenReturn(new PageImpl<>(List.of(offer), pageable, 1));

        var response = waitlistOfferService.getMyOffers(pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().getFirst().getId()).isEqualTo("waitlist-offer-1");
        assertThat(response.getContent().getFirst().getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getMyOffers_shouldRejectNonCustomerRole() {
        PageRequest pageable = PageRequest.of(0, 10);
        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);

        assertThatThrownBy(() -> waitlistOfferService.getMyOffers(pageable))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(waitlistOfferRepository, never()).findByWaitlistEntryCustomerId("customer-1", pageable);
    }

    @Test
    void acceptOffer_shouldCreateBookingAndMarkOfferConverted() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);
        BookingResponse bookingResponse = BookingResponse.builder()
                .id("booking-1")
                .customerId("customer-1")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        stubOffer(offer);
        when(bookingService.createBooking(any())).thenReturn(bookingResponse);
        when(waitlistOfferRepository.save(any(WaitlistOffer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WaitlistOfferResponse response = waitlistOfferService.acceptOffer("waitlist-offer-1");

        assertThat(response.getStatus()).isEqualTo(WaitlistOfferStatus.CONVERTED_TO_BOOKING);
        assertThat(response.getAcceptedAt()).isNotNull();
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.CONVERTED);
        verify(bookingService).createBooking(any());
        verify(waitlistEntryRepository).save(entry);
        verify(waitlistOfferRepository).save(offer);
    }

    @Test
    void acceptOffer_shouldBeIdempotentWhenOfferAlreadyConverted() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.CONVERTED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CONVERTED_TO_BOOKING);
        offer.setConvertedBookingId("booking-1");
        offer.setAcceptedAt(Instant.now());

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        stubOffer(offer);

        WaitlistOfferResponse response = waitlistOfferService.acceptOffer("waitlist-offer-1");

        assertThat(response.getStatus()).isEqualTo(WaitlistOfferStatus.CONVERTED_TO_BOOKING);
        assertThat(response.getBookingId()).isEqualTo("booking-1");
        verify(bookingService, never()).createBooking(any());
        verify(waitlistOfferRepository, never()).save(any(WaitlistOffer.class));
    }

    @Test
    void acceptOffer_shouldRejectNonOwner() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-2");
        stubOffer(offer);

        assertThatThrownBy(() -> waitlistOfferService.acceptOffer("waitlist-offer-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(bookingService, never()).createBooking(any());
    }

    @Test
    void acceptOffer_shouldRejectExpiredCreatedOffer() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);
        offer.setExpiresAt(Instant.now().minusSeconds(60));

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        stubOffer(offer);

        assertThatThrownBy(() -> waitlistOfferService.acceptOffer("waitlist-offer-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        assertThat(offer.getStatus()).isEqualTo(WaitlistOfferStatus.EXPIRED);
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.EXPIRED);
        verify(bookingService, never()).createBooking(any());
        verify(waitlistEntryRepository).save(entry);
        verify(waitlistOfferRepository).save(offer);
    }

    @Test
    void skipOffer_shouldMarkCreatedOfferSkipped() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        stubOffer(offer);
        when(waitlistOfferRepository.save(any(WaitlistOffer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WaitlistOfferResponse response = waitlistOfferService.skipOffer("waitlist-offer-1");

        assertThat(response.getStatus()).isEqualTo(WaitlistOfferStatus.SKIPPED);
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.SKIPPED);
        verify(waitlistEntryRepository).save(entry);
        verify(waitlistOfferRepository).save(offer);
    }

    @Test
    void skipOffer_shouldBeIdempotentWhenAlreadySkipped() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.SKIPPED);
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.SKIPPED);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        stubOffer(offer);

        WaitlistOfferResponse response = waitlistOfferService.skipOffer("waitlist-offer-1");

        assertThat(response.getStatus()).isEqualTo(WaitlistOfferStatus.SKIPPED);
        verify(waitlistOfferRepository, never()).save(any(WaitlistOffer.class));
    }

    @Test
    void expireCreatedOffers_shouldExpirePastCreatedOffers() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.OFFERED);
        Instant now = Instant.now();
        WaitlistOffer offer = createOffer("waitlist-offer-1", entry, 1, WaitlistOfferStatus.CREATED);
        offer.setExpiresAt(now.minusSeconds(60));

        when(waitlistOfferRepository.findExpiredTicketTypeIds(WaitlistOfferStatus.CREATED, now))
                .thenReturn(List.of("ticket-type-1"));
        when(ticketTypeRepository.findByIdForUpdate("ticket-type-1")).thenReturn(Optional.of(vip));
        when(waitlistOfferRepository.findByTicketTypeIdAndStatusAndExpiresAtLessThanEqualOrderByIdAsc(
                "ticket-type-1", WaitlistOfferStatus.CREATED, now)).thenReturn(List.of(offer));

        int expiredCount = waitlistOfferService.expireCreatedOffers(now);

        assertThat(expiredCount).isEqualTo(1);
        assertThat(offer.getStatus()).isEqualTo(WaitlistOfferStatus.EXPIRED);
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.EXPIRED);
        verify(waitlistEntryRepository).save(entry);
        verify(waitlistOfferRepository).save(offer);
    }

    @Test
    void offerNextEligibleEntry_shouldCreateOfferForOldestEligibleWaitingEntry() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1");
        vip.setQuantity(100);
        vip.setSoldQuantity(99);
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1, WaitlistEntryStatus.WAITING);
        Instant expiresAt = Instant.now().plusSeconds(900);

        when(ticketTypeRepository.findByIdForUpdate("ticket-type-1")).thenReturn(Optional.of(vip));
        when(waitlistEntryRepository.findFirstByTicketTypeIdAndStatusAndQuantityLessThanEqualOrderByCreatedAtAscIdAsc(
                "ticket-type-1",
                WaitlistEntryStatus.WAITING,
                1
        )).thenReturn(Optional.of(entry));
        when(waitlistOfferRepository.existsByWaitlistEntryIdAndStatus(
                "waitlist-entry-1",
                WaitlistOfferStatus.CREATED
        )).thenReturn(false);
        when(waitlistOfferRepository.save(any(WaitlistOffer.class))).thenAnswer(invocation -> {
            WaitlistOffer offer = invocation.getArgument(0);
            offer.setId("waitlist-offer-1");
            return offer;
        });

        Optional<WaitlistOfferResponse> response = waitlistOfferService.offerNextEligibleEntry(
                "ticket-type-1",
                expiresAt
        );

        assertThat(response).isPresent();
        assertThat(response.get().getId()).isEqualTo("waitlist-offer-1");
        assertThat(response.get().getQuantity()).isEqualTo(1);
        assertThat(entry.getStatus()).isEqualTo(WaitlistEntryStatus.OFFERED);
        verify(waitlistEntryRepository).save(entry);
    }

    private void stubEntry(WaitlistEntry entry) {
        when(waitlistEntryRepository.findTicketTypeIdById(entry.getId()))
                .thenReturn(Optional.of(entry.getTicketType().getId()));
        when(ticketTypeRepository.findByIdForUpdate(entry.getTicketType().getId()))
                .thenReturn(Optional.of(entry.getTicketType()));
        when(waitlistEntryRepository.findById(entry.getId())).thenReturn(Optional.of(entry));
    }

    private void stubOffer(WaitlistOffer offer) {
        when(waitlistOfferRepository.findTicketTypeIdById(offer.getId()))
                .thenReturn(Optional.of(offer.getTicketType().getId()));
        when(ticketTypeRepository.findByIdForUpdate(offer.getTicketType().getId()))
                .thenReturn(Optional.of(offer.getTicketType()));
        when(waitlistOfferRepository.findByIdForUpdate(offer.getId())).thenReturn(Optional.of(offer));
    }

    private WaitlistOffer createOffer(
            String id,
            WaitlistEntry entry,
            int quantity,
            WaitlistOfferStatus status
    ) {
        WaitlistOffer offer = WaitlistOffer.builder()
                .waitlistEntry(entry)
                .ticketType(entry.getTicketType())
                .quantity(quantity)
                .status(status)
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
        offer.setId(id);
        return offer;
    }

    private WaitlistEntry createWaitlistEntry(
            String id,
            User customer,
            TicketType ticketType,
            int quantity,
            WaitlistEntryStatus status
    ) {
        WaitlistEntry entry = WaitlistEntry.builder()
                .customer(customer)
                .ticketType(ticketType)
                .quantity(quantity)
                .status(status)
                .build();
        entry.setId(id);
        return entry;
    }

    private TicketType createTicketType(String id) {
        TicketType ticketType = TicketType.builder()
                .name("VIP")
                .price(BigDecimal.valueOf(500000))
                .quantity(100)
                .soldQuantity(95)
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
