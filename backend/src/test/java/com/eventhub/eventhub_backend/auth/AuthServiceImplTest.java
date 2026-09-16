package com.eventhub.eventhub_backend.auth;

import com.eventhub.eventhub_backend.auth.dto.request.LoginRequest;
import com.eventhub.eventhub_backend.auth.dto.response.LoginResponse;
import com.eventhub.eventhub_backend.auth.security.JwtService;
import com.eventhub.eventhub_backend.auth.service.Impl.AuthServiceImpl;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.mapper.UserMapper;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserMapper userMapper = mock(UserMapper.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtService jwtService = mock(JwtService.class);

    private final AuthServiceImpl authService = new AuthServiceImpl(
            userRepository,
            userMapper,
            passwordEncoder,
            jwtService
    );

    @Test
    void login_shouldReturnAccessTokenForActiveUser() {
        User user = createUser(Status.ACTIVE);
        LoginRequest request = createLoginRequest();

        when(userRepository.findByEmail("customer@eventhub.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("access-token");
        when(jwtService.getExpiration()).thenReturn(3600000L);

        LoginResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(3600000L);
    }

    @Test
    void login_shouldRejectInactiveUser() {
        User user = createUser(Status.INACTIVE);
        LoginRequest request = createLoginRequest();

        when(userRepository.findByEmail("customer@eventhub.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(jwtService, never()).generateToken(user);
    }

    @Test
    void login_shouldRejectBannedUser() {
        User user = createUser(Status.BANNED);
        LoginRequest request = createLoginRequest();

        when(userRepository.findByEmail("customer@eventhub.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(jwtService, never()).generateToken(user);
    }

    private LoginRequest createLoginRequest() {
        return LoginRequest.builder()
                .email("customer@eventhub.com")
                .password("password123")
                .build();
    }

    private User createUser(Status status) {
        return User.builder()
                .email("customer@eventhub.com")
                .password("hashed-password")
                .fullName("Customer")
                .role(Role.CUSTOMER)
                .status(status)
                .build();
    }
}
