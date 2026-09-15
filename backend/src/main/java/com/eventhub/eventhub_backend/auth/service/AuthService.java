package com.eventhub.eventhub_backend.auth.service;


import com.eventhub.eventhub_backend.auth.dto.request.LoginRequest;
import com.eventhub.eventhub_backend.auth.dto.request.RegisterRequest;
import com.eventhub.eventhub_backend.auth.dto.response.LoginResponse;
import com.eventhub.eventhub_backend.auth.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

}
