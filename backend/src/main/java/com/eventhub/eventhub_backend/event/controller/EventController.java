package com.eventhub.eventhub_backend.event.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.service.EventService;
import com.eventhub.eventhub_backend.event.service.EventStatsService;
import com.eventhub.eventhub_backend.admin.dto.response.EventStatsResponse;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventStatsService eventStatsService;
    private final CurrentUserService currentUserService;

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest request) {

        String currentUserId = currentUserService.getCurrentUserId();

        EventResponse response = eventService.createEvent(request, currentUserId);

        return ApiResponse.<EventResponse>builder().code(1000).message("Event created successfully").result(response).build();
    }

    @GetMapping
    public ApiResponse<PageResponse<EventResponse>> getEvents(@ModelAttribute EventSearchRequest request, Pageable pageable) {

        PageResponse<EventResponse> response = eventService.getEvents(request, pageable);

        return ApiResponse.<PageResponse<EventResponse>>builder().code(ErrorCode.SUCCESS.getCode()).message("Events retrieved successfully").result(response).build();

    }


    @GetMapping("/public")
    public ApiResponse<PageResponse<EventResponse>> getPublishedEvents(@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<EventResponse> response = eventService.getPublishedEvents(pageable);

        return ApiResponse.<PageResponse<EventResponse>>builder().code(ErrorCode.SUCCESS.getCode()).message("Published events retrieved successfully").result(response).build();
    }

    @GetMapping("/public/{eventId}")
    public ApiResponse<EventResponse> getPublishedEvent(@PathVariable String eventId) {

        EventResponse response = eventService.getPublishedEvent(eventId);

        return ApiResponse.<EventResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Published event retrieved successfully").result(response).build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PatchMapping("/{eventId}")
    public ApiResponse<EventResponse> updateEvents(@PathVariable String eventId, @Valid @RequestBody UpdateEventRequest request) {
        EventResponse response = eventService.updateEvent(eventId, request);

        return ApiResponse.<EventResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Event updated successfully").result(response).build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PostMapping("/{eventId}/publish")
    public ApiResponse<EventResponse> publishEvent(@PathVariable String eventId) {

        EventResponse response = eventService.publishEvent(eventId);
        return ApiResponse.<EventResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Published events successfully").result(response).build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PostMapping("/{eventId}/cancel")
    public ApiResponse<EventResponse> cancelEvent(@PathVariable String eventId) {
        EventResponse response = eventService.cancelEvent(eventId);

        return ApiResponse.<EventResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Event cancelled successfully").result(response).build();
    }



        @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @GetMapping("/my-events")
    public ApiResponse<PageResponse<EventResponse>> getMyEvents(
            @RequestParam(required = false) com.eventhub.eventhub_backend.event.entity.EventStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<EventResponse> response = eventService.getMyEvents(status, keyword, pageable);
        return ApiResponse.<PageResponse<EventResponse>>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("My events retrieved successfully")
                .result(response)
                .build();
    }

    @GetMapping("/{eventId}")
    public ApiResponse<EventResponse> getEvent(@PathVariable String eventId) {

        EventResponse response = eventService.getEvent(eventId);
        return ApiResponse.<EventResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Get Event Detail successfully").result(response).build();

    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @GetMapping("/{eventId}/stats")
    public ApiResponse<EventStatsResponse> getEventStats(@PathVariable String eventId) {
        EventStatsResponse response = eventStatsService.getEventStats(eventId);
        return ApiResponse.<EventStatsResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Event statistics retrieved successfully")
                .result(response)
                .build();
    }
}
