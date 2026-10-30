package com.eventhub.eventhub_backend.admin.controller;

import com.eventhub.eventhub_backend.admin.dto.request.UpdateUserStatusRequest;
import com.eventhub.eventhub_backend.admin.dto.response.UserAdminResponse;
import com.eventhub.eventhub_backend.admin.service.AdminUserService;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<UserAdminResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Status status,
            Pageable pageable
    ) {
        PageResponse<UserAdminResponse> response = adminUserService.getUsers(keyword, role, status, pageable);

        return ApiResponse.<PageResponse<UserAdminResponse>>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Users list retrieved successfully")
                .result(response)
                .build();
    }

    @PatchMapping("/{userId}/status")
    public ApiResponse<UserAdminResponse> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserAdminResponse response = adminUserService.updateUserStatus(userId, request);

        return ApiResponse.<UserAdminResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("User status updated successfully")
                .result(response)
                .build();
    }
}
