package com.eventhub.eventhub_backend.user;


import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordEncoderTest {

    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @Test
    void shouldEncodeAndMatchPassword() {

        String rawPassword = "123456";

        String encodedPassword =
                passwordEncoder.encode(rawPassword);

        System.out.println(encodedPassword);

        assertThat(encodedPassword)
                .isNotEqualTo(rawPassword);

        assertThat(passwordEncoder.matches(
                rawPassword,
                encodedPassword
        )).isTrue();

        assertThat(passwordEncoder.matches(
                "wrong-password",
                encodedPassword
        )).isFalse();
    }
}