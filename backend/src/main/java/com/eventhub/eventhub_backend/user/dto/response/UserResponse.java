package com.eventhub.eventhub_backend.user.dto.response;


import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;
    String email;
    String fullName;
    String phone;
    String avatarUrl;
    Role role;
    Status status;
    Instant createdAt;
    Instant updatedAt;
}
