package com.eventhub.eventhub_backend.auth.security;

import com.eventhub.eventhub_backend.user.entity.User;

public interface JwtService {
    String generateToken(User user);

    long getExpiration();
    String extractUserId(String token);
    boolean isValid(String token);

}
