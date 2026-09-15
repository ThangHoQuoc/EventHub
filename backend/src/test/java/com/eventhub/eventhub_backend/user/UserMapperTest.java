package com.eventhub.eventhub_backend.user;


import com.eventhub.eventhub_backend.auth.dto.request.RegisterRequest;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private final UserMapper userMapper =
            Mappers.getMapper(UserMapper.class);

    @Test
    void shouldMapRegisterRequestToUser() {

        RegisterRequest request = new RegisterRequest(
                "test@eventhub.com",
                "password123",
                "Test User",
                "0123456789"
        );

        User user = userMapper.toUser(request);

        assertThat(user.getEmail())
                .isEqualTo(request.getEmail());

        assertThat(user.getPassword())
                .isEqualTo(request.getPassword());

        assertThat(user.getFullName())
                .isEqualTo(request.getFullName());

        assertThat(user.getPhone())
                .isEqualTo(request.getPhone());

        assertThat(user.getRole()).isNull();
        assertThat(user.getStatus()).isNull();
        assertThat(user.getId()).isNull();
    }
}