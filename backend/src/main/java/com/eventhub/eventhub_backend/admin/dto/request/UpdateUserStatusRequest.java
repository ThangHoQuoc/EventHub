package com.eventhub.eventhub_backend.admin.dto.request;

import com.eventhub.eventhub_backend.user.entity.Status;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserStatusRequest {

    @NotNull(message = "Trạng thái người dùng không được để trống")
    Status status;
}
