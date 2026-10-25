package com.eventhub.eventhub_backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserProfileRequest {

    @NotBlank(message = "Full name cannot be blank")
    String fullName;

    String phone;

    String avatarUrl;
}
