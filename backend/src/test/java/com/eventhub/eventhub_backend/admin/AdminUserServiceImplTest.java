package com.eventhub.eventhub_backend.admin;

import com.eventhub.eventhub_backend.admin.dto.request.UpdateUserStatusRequest;
import com.eventhub.eventhub_backend.admin.dto.response.UserAdminResponse;
import com.eventhub.eventhub_backend.admin.service.Impl.AdminUserServiceImpl;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminUserServiceImplTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private AdminUserServiceImpl adminUserService;

    @BeforeEach
    void setUp() {
        adminUserService = new AdminUserServiceImpl(userRepository, currentUserService);
    }

    @Test
    void getUsers_shouldReturnPaginatedUsers() {
        User user1 = User.builder().email("user1@gmail.com").fullName("User One").role(Role.CUSTOMER).status(Status.ACTIVE).build();
        user1.setId("u1");

        Page<User> userPage = new PageImpl<>(List.of(user1), PageRequest.of(0, 10), 1);
        when(userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(userPage);

        PageResponse<UserAdminResponse> result = adminUserService.getUsers("User", Role.CUSTOMER, Status.ACTIVE, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("user1@gmail.com");
    }

    @Test
    void updateUserStatus_shouldUpdateAndSave() {
        User user = User.builder().email("user2@gmail.com").fullName("User Two").role(Role.ORGANIZER).status(Status.ACTIVE).build();
        user.setId("u2");

        when(userRepository.findById("u2")).thenReturn(Optional.of(user));
        when(currentUserService.getCurrentUserId()).thenReturn("admin-id");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserAdminResponse response = adminUserService.updateUserStatus("u2", UpdateUserStatusRequest.builder().status(Status.BANNED).build());

        assertThat(response.getStatus()).isEqualTo(Status.BANNED);
        verify(userRepository).save(user);
    }

    @Test
    void updateUserStatus_whenSelfLock_shouldThrowException() {
        User admin = User.builder().email("admin@eventhub.vn").fullName("Admin Master").role(Role.ADMIN).status(Status.ACTIVE).build();
        admin.setId("admin-id");

        when(userRepository.findById("admin-id")).thenReturn(Optional.of(admin));
        when(currentUserService.getCurrentUserId()).thenReturn("admin-id");

        assertThatThrownBy(() -> adminUserService.updateUserStatus("admin-id", UpdateUserStatusRequest.builder().status(Status.BANNED).build()))
                .isInstanceOf(AppException.class);

        verify(userRepository, never()).save(any());
    }
}
