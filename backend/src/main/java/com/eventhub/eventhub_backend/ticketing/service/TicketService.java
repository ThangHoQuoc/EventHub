package com.eventhub.eventhub_backend.ticketing.service;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.ticketing.dto.request.CheckInTicketRequest;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TicketService {

    List<TicketResponse> issueTicketsForBooking(Booking booking);

    PageResponse<TicketResponse> getMyTickets(Pageable pageable);

    TicketResponse getMyTicket(String ticketId);

    TicketResponse checkInTicket(CheckInTicketRequest request);

    void resendTicketEmail(String ticketCode);
}
