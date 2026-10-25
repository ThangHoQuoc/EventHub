package com.eventhub.eventhub_backend.user;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.user.dto.request.ChangePasswordRequest;
import com.eventhub.eventhub_backend.user.dto.request.UpdateUserProfileRequest;
import com.eventhub.eventhub_backend.user.dto.response.UserResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.mapper.UserMapper;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import com.eventhub.eventhub_backend.user.service.Impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    UserRepository userRepository;
    @Mock
    UserMapper userMapper;
    @Mock
    CurrentUserService currentUserService;
    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .email("john@example.com")
                .password("hashed-password")
                .fullName("John Doe")
                .phone("0987654321")
                .role(Role.CUSTOMER)
                .status(Status.ACTIVE)
                .build();
        sampleUser.setId("usr-123");
    }

    @Test
    void updateProfile_success() {
        when(currentUserService.getCurrentUserId()).thenReturn("usr-123");
        when(userRepository.findById("usr-123")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse expectedResponse = UserResponse.builder()
                .id("usr-123")
                .fullName("John Updated")
                .phone("0123456789")
                .build();
        when(userMapper.toUserResponse(any(User.class))).thenReturn(expectedResponse);

        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .fullName("John Updated")
                .phone("0123456789")
                .avatarUrl("https://example.com/avatar.png")
                .build();

        UserResponse response = userService.updateProfile(request);

        assertNotNull(response);
        assertEquals("John Updated", response.getFullName());
        assertEquals("0123456789", response.getPhone());
        verify(userRepository).save(sampleUser);
    }

    @Test
    void changePassword_success() {
        when(currentUserService.getCurrentUserId()).thenReturn("usr-123");
        when(userRepository.findById("usr-123")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPass123", "hashed-password")).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("new-hashed-pass");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPass123")
                .newPassword("newPass123")
                .build();

        assertDoesNotThrow(() -> userService.changePassword(request));
        assertEquals("new-hashed-pass", sampleUser.getPassword());
        verify(userRepository).save(sampleUser);
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsException() {
        when(currentUserService.getCurrentUserId()).thenReturn("usr-123");
        when(userRepository.findById("usr-123")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPass", "hashed-password")).thenReturn(false);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrongPass")
                .newPassword("newPass123")
                .build();

        AppException ex = assertThrows(AppException.class, () -> userService.changePassword(request));
        assertEquals(ErrorCode.INVALID_PASSWORD, ex.getErrorCode());
        verify(userRepository, never()).save(any());
    }
}
