package com.eventhub.eventhub_backend.waitlist;

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
import com.eventhub.eventhub_backend.waitlist.dto.request.JoinWaitlistRequest;
import com.eventhub.eventhub_backend.waitlist.dto.response.WaitlistEntryResponse;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntryStatus;
import com.eventhub.eventhub_backend.waitlist.repository.WaitlistEntryRepository;
import com.eventhub.eventhub_backend.waitlist.service.Impl.WaitlistServiceImpl;
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

class WaitlistServiceImplTest {

    private final WaitlistEntryRepository waitlistEntryRepository = mock(WaitlistEntryRepository.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final WaitlistServiceImpl waitlistService = new WaitlistServiceImpl(
            waitlistEntryRepository,
            ticketTypeRepository,
            userRepository,
            currentUserService
    );

    @Test
    void joinWaitlist_shouldCreateWaitingEntryForSoldOutTicketType() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", 100, 100, EventStatus.PUBLISHED);
        JoinWaitlistRequest request = JoinWaitlistRequest.builder()
                .quantity(2)
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findByIdForUpdate("ticket-type-1")).thenReturn(Optional.of(vip));
        when(waitlistEntryRepository.existsByCustomerIdAndTicketTypeIdAndStatusIn(
                "customer-1",
                "ticket-type-1",
                WaitlistServiceImpl.ACTIVE_STATUSES
        )).thenReturn(false);
        when(waitlistEntryRepository.save(any(WaitlistEntry.class))).thenAnswer(invocation -> {
            WaitlistEntry entry = invocation.getArgument(0);
            entry.setId("waitlist-entry-1");
            return entry;
        });

        WaitlistEntryResponse response = waitlistService.joinWaitlist("ticket-type-1", request);

        assertThat(response.getId()).isEqualTo("waitlist-entry-1");
        assertThat(response.getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getTicketTypeId()).isEqualTo("ticket-type-1");
        assertThat(response.getQuantity()).isEqualTo(2);
        assertThat(response.getStatus()).isEqualTo(WaitlistEntryStatus.WAITING);
        verify(waitlistEntryRepository).save(any(WaitlistEntry.class));
    }

    @Test
    void joinWaitlist_shouldRejectWhenTicketTypeStillHasAvailableQuantity() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", 100, 99, EventStatus.PUBLISHED);
        JoinWaitlistRequest request = JoinWaitlistRequest.builder()
                .quantity(1)
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findByIdForUpdate("ticket-type-1")).thenReturn(Optional.of(vip));

        assertThatThrownBy(() -> waitlistService.joinWaitlist("ticket-type-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistEntryRepository, never()).save(any(WaitlistEntry.class));
    }

    @Test
    void joinWaitlist_shouldRejectDuplicateActiveEntry() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", 100, 100, EventStatus.PUBLISHED);
        JoinWaitlistRequest request = JoinWaitlistRequest.builder()
                .quantity(1)
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(userRepository.findById("customer-1")).thenReturn(Optional.of(customer));
        when(ticketTypeRepository.findByIdForUpdate("ticket-type-1")).thenReturn(Optional.of(vip));
        when(waitlistEntryRepository.existsByCustomerIdAndTicketTypeIdAndStatusIn(
                "customer-1",
                "ticket-type-1",
                WaitlistServiceImpl.ACTIVE_STATUSES
        )).thenReturn(true);

        assertThatThrownBy(() -> waitlistService.joinWaitlist("ticket-type-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(waitlistEntryRepository, never()).save(any(WaitlistEntry.class));
    }

    @Test
    void getMyWaitlist_shouldReturnCurrentCustomerEntries() {
        User customer = createCustomer("customer-1");
        TicketType vip = createTicketType("ticket-type-1", 100, 100, EventStatus.PUBLISHED);
        WaitlistEntry entry = createWaitlistEntry("waitlist-entry-1", customer, vip, 1);
        PageRequest pageable = PageRequest.of(0, 10);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.CUSTOMER);
        when(currentUserService.getCurrentUserId()).thenReturn("customer-1");
        when(waitlistEntryRepository.findByCustomerId("customer-1", pageable))
                .thenReturn(new PageImpl<>(List.of(entry), pageable, 1));

        var response = waitlistService.getMyWaitlist(pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().getFirst().getId()).isEqualTo("waitlist-entry-1");
        assertThat(response.getContent().getFirst().getCustomerId()).isEqualTo("customer-1");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    void joinWaitlist_shouldRejectNonCustomerRole() {
        JoinWaitlistRequest request = JoinWaitlistRequest.builder()
                .quantity(1)
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);

        assertThatThrownBy(() -> waitlistService.joinWaitlist("ticket-type-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(waitlistEntryRepository, never()).save(any(WaitlistEntry.class));
    }

    private WaitlistEntry createWaitlistEntry(String id, User customer, TicketType ticketType, int quantity) {
        WaitlistEntry entry = WaitlistEntry.builder()
                .customer(customer)
                .ticketType(ticketType)
                .quantity(quantity)
                .status(WaitlistEntryStatus.WAITING)
                .build();
        entry.setId(id);
        return entry;
    }

    private TicketType createTicketType(String id, int quantity, int soldQuantity, EventStatus status) {
        TicketType ticketType = TicketType.builder()
                .name("VIP")
                .price(BigDecimal.valueOf(500000))
                .quantity(quantity)
                .soldQuantity(soldQuantity)
                .event(createEvent(status))
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
