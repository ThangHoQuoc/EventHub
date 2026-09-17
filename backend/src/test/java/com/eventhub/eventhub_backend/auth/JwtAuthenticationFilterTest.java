package com.eventhub.eventhub_backend.auth;

import com.eventhub.eventhub_backend.auth.security.Impl.JwtAuthenticationFilter;
import com.eventhub.eventhub_backend.auth.security.JwtService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userRepository);

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_shouldSetAuthenticationForActiveUser() throws Exception {
        MockHttpServletRequest request = createRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);
        User user = createUser(Status.ACTIVE);

        when(jwtService.isValid("valid-token")).thenReturn(true);
        when(jwtService.extractUserId("valid-token")).thenReturn("user-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("user-1");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_shouldNotAuthenticateInactiveUser() throws Exception {
        MockHttpServletRequest request = createRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);
        User user = createUser(Status.INACTIVE);

        when(jwtService.isValid("valid-token")).thenReturn(true);
        when(jwtService.extractUserId("valid-token")).thenReturn("user-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_shouldNotAuthenticateBannedUser() throws Exception {
        MockHttpServletRequest request = createRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);
        User user = createUser(Status.BANNED);

        when(jwtService.isValid("valid-token")).thenReturn(true);
        when(jwtService.extractUserId("valid-token")).thenReturn("user-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    private MockHttpServletRequest createRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");

        return request;
    }

    private User createUser(Status status) {
        User user = User.builder()
                .email("customer@eventhub.com")
                .password("hashed-password")
                .fullName("Customer")
                .role(Role.CUSTOMER)
                .status(status)
                .build();
        user.setId("user-1");

        return user;
    }
}
