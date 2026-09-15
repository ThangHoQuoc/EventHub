package com.eventhub.eventhub_backend.ticket.controller;


import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.ticket.dto.request.CreateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.request.UpdateTicketTypeRequest;
import com.eventhub.eventhub_backend.ticket.dto.response.TicketTypeResponse;
import com.eventhub.eventhub_backend.ticket.service.TicketTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
@RequestMapping("/api/v1/events")
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;


    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PostMapping("/{eventId}/ticket-types")
    public ApiResponse<TicketTypeResponse> createTicketType(@PathVariable String eventId, @Valid @RequestBody CreateTicketTypeRequest request) {

        TicketTypeResponse response = ticketTypeService.createTicketType(eventId, request);

        return ApiResponse.<TicketTypeResponse>builder().code(1000).message("TicketType created successfully").result(response).build();

    }

    @GetMapping("/{eventId}/ticket-types")
    public ApiResponse<List<TicketTypeResponse>> getTicketTypes(@PathVariable String eventId) {

        List<TicketTypeResponse> response = ticketTypeService.getTicketTypesByEvent(eventId);

        return ApiResponse.<List<TicketTypeResponse>>builder().code(1000).message("TicketTypes retrieved successfully").result(response).build();

    }

    @GetMapping("/ticket-types/{ticketTypeId}")
    public ApiResponse<TicketTypeResponse> getTicketTypeById(@PathVariable String ticketTypeId) {

        TicketTypeResponse response = ticketTypeService.getTicketTypeById(ticketTypeId);

        return ApiResponse.<TicketTypeResponse>builder().code(1000).message("TicketType retrieved successfully").result(response).build();
    }

    @PatchMapping("/ticket-types/{ticketTypeId}")
    public ApiResponse<TicketTypeResponse> updateTicketType(@PathVariable String ticketTypeId, @Valid @RequestBody UpdateTicketTypeRequest request) {
        TicketTypeResponse response = ticketTypeService.updateTicketType(ticketTypeId, request);


        return ApiResponse.<TicketTypeResponse>builder().code(1000).message("TicketType updated successfully").result(response).build();

    }
    }
