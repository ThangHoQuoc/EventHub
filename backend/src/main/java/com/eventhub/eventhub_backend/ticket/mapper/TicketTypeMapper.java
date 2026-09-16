package com.eventhub.eventhub_backend.ticket.mapper;


import com.eventhub.eventhub_backend.ticket.dto.request.CreateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TicketTypeMapper {

    @Mapping(source = "event.id", target = "eventId")
    @Mapping(target = "availableQuantity", expression = "java(calculateAvailableQuantity(ticketType))")
    TicketTypeResponse toTicketTypeResponse(TicketType ticketType);

    TicketType toTicketType(CreateTicketTypeRequest createTicketTypeRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateTicketType(@MappingTarget TicketType ticketType, UpdateTicketTypeRequest request);

    default Integer calculateAvailableQuantity(TicketType ticketType) {
        if (ticketType.getQuantity() == null || ticketType.getSoldQuantity() == null) {
            return null;
        }

        return ticketType.getQuantity() - ticketType.getSoldQuantity();
    }
}
