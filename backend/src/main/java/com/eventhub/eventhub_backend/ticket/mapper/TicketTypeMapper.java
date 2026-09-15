package com.eventhub.eventhub_backend.ticket.mapper;


import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.ticket.dto.request.CreateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TicketTypeMapper {
    TicketTypeResponse toTicketTypeResponse(TicketType ticketType);

    TicketType toTicketType(CreateTicketTypeRequest createTicketTypeRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateTicketType(@MappingTarget TicketType ticketType, UpdateTicketTypeRequest request);
}
