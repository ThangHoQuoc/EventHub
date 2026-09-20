package com.eventhub.eventhub_backend.ticketing.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.ticketing.dto.request.CheckInTicketRequest;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ApiResponse<PageResponse<TicketResponse>> getMyTickets(Pageable pageable) {
        PageResponse<TicketResponse> response = ticketService.getMyTickets(pageable);

        return ApiResponse.<PageResponse<TicketResponse>>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Tickets retrieved successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{ticketId}")
    public ApiResponse<TicketResponse> getMyTicket(@PathVariable String ticketId) {
        TicketResponse response = ticketService.getMyTicket(ticketId);

        return ApiResponse.<TicketResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Ticket retrieved successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PostMapping("/check-in")
    public ApiResponse<TicketResponse> checkInTicket(@Valid @RequestBody CheckInTicketRequest request) {
        TicketResponse response = ticketService.checkInTicket(request);

        return ApiResponse.<TicketResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Ticket checked in successfully")
                .result(response)
                .build();
    }
}
