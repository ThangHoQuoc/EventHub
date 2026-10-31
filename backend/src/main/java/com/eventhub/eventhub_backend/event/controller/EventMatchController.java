package com.eventhub.eventhub_backend.event.controller;

import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.event.dto.request.EventMatchRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventMatchResponse;
import com.eventhub.eventhub_backend.event.service.EventMatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventMatchController {

    private final EventMatchingService eventMatchingService;

    @PostMapping("/match")
    public ApiResponse<EventMatchResponse> matchEvents(@Valid @RequestBody EventMatchRequest request) {
        EventMatchResponse response = eventMatchingService.matchEvents(request);
        return ApiResponse.<EventMatchResponse>builder()
                .code(1000)
                .message("Events matched successfully")
                .result(response)
                .build();
    }
}
