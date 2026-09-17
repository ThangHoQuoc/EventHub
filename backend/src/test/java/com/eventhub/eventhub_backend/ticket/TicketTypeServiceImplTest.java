package com.eventhub.eventhub_backend.ticket;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.mapper.TicketTypeMapper;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticket.service.Impl.TicketTypeServiceImpl;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketTypeServiceImplTest {

    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final TicketTypeRepository ticketTypeRepository = mock(TicketTypeRepository.class);
    private final EventRepository eventRepository = mock(EventRepository.class);
    private final TicketTypeMapper ticketTypeMapper = Mappers.getMapper(TicketTypeMapper.class);

    private final TicketTypeServiceImpl ticketTypeService = new TicketTypeServiceImpl(
            currentUserService,
            ticketTypeMapper,
            ticketTypeRepository,
            eventRepository
    );

    @Test
    void updateTicketType_shouldUpdateProvidedFieldsAndKeepOmittedFields() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);
        TicketType standard = createTicketType("ticket-type-2", "Standard", event);

        UpdateTicketTypeRequest request = UpdateTicketTypeRequest.builder()
                .name("VIP Premium")
                .price(BigDecimal.valueOf(700000))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(ticketTypeRepository.findByEventId("event-1")).thenReturn(List.of(vip, standard));

        TicketTypeResponse response = ticketTypeService.updateTicketType("ticket-type-1", request);

        assertThat(response.getId()).isEqualTo("ticket-type-1");
        assertThat(response.getEventId()).isEqualTo("event-1");
        assertThat(response.getName()).isEqualTo("VIP Premium");
        assertThat(response.getDescription()).isEqualTo("Front seats");
        assertThat(response.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(700000));
        assertThat(response.getQuantity()).isEqualTo(100);
        assertThat(response.getSoldQuantity()).isEqualTo(25);
        assertThat(response.getAvailableQuantity()).isEqualTo(75);
    }

    @Test
    void updateTicketType_shouldRejectDuplicateNameInSameEvent() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);
        TicketType standard = createTicketType("ticket-type-2", "Standard", event);

        UpdateTicketTypeRequest request = UpdateTicketTypeRequest.builder()
                .name("Standard")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(ticketTypeRepository.findByEventId("event-1")).thenReturn(List.of(vip, standard));

        assertThatThrownBy(() -> ticketTypeService.updateTicketType("ticket-type-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.TICKET_TYPE_ALREADY_EXIST);
    }

    @Test
    void updateTicketType_shouldRejectQuantityBelowSoldQuantity() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);

        UpdateTicketTypeRequest request = UpdateTicketTypeRequest.builder()
                .quantity(20)
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));
        when(ticketTypeRepository.findByEventId("event-1")).thenReturn(List.of(vip));

        assertThatThrownBy(() -> ticketTypeService.updateTicketType("ticket-type-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        assertThat(vip.getQuantity()).isEqualTo(100);
        verify(ticketTypeRepository, never()).save(vip);
    }

    @Test
    void deleteTicketType_shouldDeleteWhenOrganizerOwnsDraftEventAndNoTicketsSold() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);
        vip.setSoldQuantity(0);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));

        ticketTypeService.deleteTicketType("ticket-type-1");

        verify(ticketTypeRepository).delete(vip);
    }

    @Test
    void deleteTicketType_shouldRejectWhenTicketsWereSold() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));

        assertThatThrownBy(() -> ticketTypeService.deleteTicketType("ticket-type-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(ticketTypeRepository, never()).delete(vip);
    }

    @Test
    void deleteTicketType_shouldRejectWhenOrganizerDoesNotOwnEvent() {
        Event event = createDraftEvent();
        TicketType vip = createTicketType("ticket-type-1", "VIP", event);
        vip.setSoldQuantity(0);

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-2");
        when(ticketTypeRepository.findById("ticket-type-1")).thenReturn(Optional.of(vip));

        assertThatThrownBy(() -> ticketTypeService.deleteTicketType("ticket-type-1"))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(ticketTypeRepository, never()).delete(vip);
    }

    private Event createDraftEvent() {
        User organizer = User.builder()
                .build();
        organizer.setId("organizer-1");

        Event event = Event.builder()
                .status(EventStatus.DRAFT)
                .organizer(organizer)
                .build();
        event.setId("event-1");

        return event;
    }

    private TicketType createTicketType(String id, String name, Event event) {
        TicketType ticketType = TicketType.builder()
                .name(name)
                .description("Front seats")
                .price(BigDecimal.valueOf(500000))
                .quantity(100)
                .soldQuantity(25)
                .event(event)
                .build();
        ticketType.setId(id);

        return ticketType;
    }
}
