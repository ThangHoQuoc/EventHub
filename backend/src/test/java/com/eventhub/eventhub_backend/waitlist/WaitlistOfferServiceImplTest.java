package com.eventhub.eventhub_backend.waitlist;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
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
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final WaitlistOfferServiceImpl waitlistOfferService = new WaitlistOfferServiceImpl(
            waitlistEntryRepository,
            waitlistOfferRepository,
            currentUserService
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

        when(waitlistEntryRepository.findById("waitlist-entry-1")).thenReturn(Optional.of(entry));
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

        when(waitlistEntryRepository.findById("waitlist-entry-1")).thenReturn(Optional.of(entry));

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

        when(waitlistEntryRepository.findById("waitlist-entry-1")).thenReturn(Optional.of(entry));
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

        when(waitlistEntryRepository.findById("waitlist-entry-1")).thenReturn(Optional.of(entry));

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
                .soldQuantity(100)
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
