package com.eventhub.eventhub_backend.ticket.service.Impl;


import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.ticket.dto.request.CreateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.mapper.TicketTypeMapper;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticket.service.TicketTypeService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketTypeServiceImpl implements TicketTypeService {

    private final CurrentUserService currentUserService;
    private final TicketTypeMapper ticketTypeMapper;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;

    @Override
    public TicketTypeResponse createTicketType(String eventId, CreateTicketTypeRequest request) {

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        List<TicketType> ticketTypes = ticketTypeRepository.findByEventId(eventId);


        Role role = currentUserService.getCurrentUserRole();
        if (role == Role.ORGANIZER && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        boolean exist = ticketTypes.stream().anyMatch(ticketType -> ticketType.getName().equalsIgnoreCase(request.getName()));

        if (exist) {
            throw new AppException(ErrorCode.TICKET_TYPE_ALREADY_EXIST);
        }

        TicketType result = ticketTypeMapper.toTicketType(request);
        result.setEvent(event);
        result.setSoldQuantity(0);
        ticketTypeRepository.save(result);
        return ticketTypeMapper.toTicketTypeResponse(result);
    }

    @Override
    public List<TicketTypeResponse> getTicketTypesByEvent(String eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        List<TicketType> ticketTypes = ticketTypeRepository.findByEventId(eventId);
        return ticketTypes.stream().map(ticketTypeMapper::toTicketTypeResponse).toList();
    }

    @Override
    public TicketTypeResponse getTicketTypeById(String ticketTypeId) {

        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId).orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));

        return ticketTypeMapper.toTicketTypeResponse(ticketType);
    }

    @Override
    public TicketTypeResponse updateTicketType(String ticketTypeId, UpdateTicketTypeRequest request) {

        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId).orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));

        Event event = ticketType.getEvent();

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Role role = currentUserService.getCurrentUserRole();

        if (role == Role.ORGANIZER
                && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<TicketType> ticketTypes = ticketTypeRepository.findByEventId(event.getId());


        if()
        ticketTypeMapper.updateTicketType(ticketType, request);

        ticketTypeRepository.save(ticketType);
        return ticketTypeMapper.toTicketTypeResponse(ticketType);
    }
}
