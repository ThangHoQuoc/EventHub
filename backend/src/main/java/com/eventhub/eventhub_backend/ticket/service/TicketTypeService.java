package com.eventhub.eventhub_backend.ticket.service;


import com.eventhub.eventhub_backend.ticket.dto.request.CreateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;

import java.util.List;

public interface TicketTypeService {
    TicketTypeResponse createTicketType(String eventId, CreateTicketTypeRequest request);

    List<TicketTypeResponse> getTicketTypesByEvent(String eventId);

    TicketTypeResponse getTicketTypeById(String ticketTypeId);

    TicketTypeResponse updateTicketType(String ticketTypeId, UpdateTicketTypeRequest request);
}
