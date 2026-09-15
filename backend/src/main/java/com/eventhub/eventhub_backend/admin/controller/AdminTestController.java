package com.eventhub.eventhub_backend.admin.controller;

import com.eventhub.eventhub_backend.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminTestController {

    @GetMapping("/test")
    public ApiResponse<String> test() {

        return ApiResponse.<String>builder()
                .code(1000)
                .message("Admin authorization successful")
                .result("Hello Admin")
                .build();
    }
}