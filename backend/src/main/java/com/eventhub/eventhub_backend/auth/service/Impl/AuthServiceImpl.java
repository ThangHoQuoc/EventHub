package com.eventhub.eventhub_backend.auth.service.Impl;


import com.eventhub.eventhub_backend.auth.dto.request.LoginRequest;
import com.eventhub.eventhub_backend.auth.dto.request.RegisterRequest;
import com.eventhub.eventhub_backend.auth.dto.response.LoginResponse;
import com.eventhub.eventhub_backend.auth.dto.response.RegisterResponse;
import com.eventhub.eventhub_backend.auth.security.JwtService;
import com.eventhub.eventhub_backend.auth.service.AuthService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.mapper.UserMapper;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {


    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);

        }

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setStatus(Status.ACTIVE);

        userRepository.save(user);
        return userMapper.toRegisterResponse(user);

    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        if (user.getStatus() != Status.ACTIVE) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String accessToken = jwtService.generateToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpiration())
                .build();
    }


}
