package com.eventhub.eventhub_backend.user;

import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {

        User user = User.builder()
                .email("test@eventhub.com")
                .password("hashed-password")
                .fullName("Test User")
                .phone("0123456789")
                .role(Role.CUSTOMER)
                .status(Status.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();

        User foundUser = userRepository
                .findByEmail("test@eventhub.com")
                .orElseThrow();

        assertThat(foundUser.getEmail())
                .isEqualTo("test@eventhub.com");
    }
}