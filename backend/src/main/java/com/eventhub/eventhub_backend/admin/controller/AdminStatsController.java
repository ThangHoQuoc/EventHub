package com.eventhub.eventhub_backend.admin.controller;

import com.eventhub.eventhub_backend.admin.dto.response.AdminPlatformStatsResponse;
import com.eventhub.eventhub_backend.admin.service.AdminStatsService;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    AdminStatsService adminStatsService;

    @GetMapping
    public ApiResponse<AdminPlatformStatsResponse> getPlatformStats() {
        AdminPlatformStatsResponse response = adminStatsService.getPlatformStats();

        return ApiResponse.<AdminPlatformStatsResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Platform statistics retrieved successfully")
                .result(response)
                .build();
    }
}
