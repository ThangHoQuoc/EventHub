package com.eventhub.eventhub_backend.user.controller;

import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.user.dto.response.UserResponse;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser() {

        UserResponse userResponse = currentUserService.getCurrentUser();

        return ApiResponse.<UserResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Get current user successfully").result(userResponse).build();
    }
}