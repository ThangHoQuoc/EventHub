package com.eventhub.eventhub_backend.auth.controller;


import com.eventhub.eventhub_backend.auth.dto.request.LoginRequest;
import com.eventhub.eventhub_backend.auth.dto.request.RegisterRequest;
import com.eventhub.eventhub_backend.auth.dto.response.LoginResponse;
import com.eventhub.eventhub_backend.auth.dto.response.RegisterResponse;
import com.eventhub.eventhub_backend.auth.service.AuthService;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {


        return ApiResponse.<RegisterResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Registration successful").result(authService.register(request)).build();
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        return ApiResponse.<LoginResponse>builder().code(ErrorCode.SUCCESS.getCode()).message("Login successful").result(authService.login(request)).build();
    }

    @GetMapping("/test")
    public String test() {
        return "Authenticated successfully";
    }

}