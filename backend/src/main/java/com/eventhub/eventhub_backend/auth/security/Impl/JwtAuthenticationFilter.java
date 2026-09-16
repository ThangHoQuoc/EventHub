package com.eventhub.eventhub_backend.auth.security.Impl;

import com.eventhub.eventhub_backend.auth.security.JwtService;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;



    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = jwtService.extractUserId(token);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty() || userOptional.get().getStatus() != Status.ACTIVE) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        User user = userOptional.get();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().name()
                                )
                        )
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
