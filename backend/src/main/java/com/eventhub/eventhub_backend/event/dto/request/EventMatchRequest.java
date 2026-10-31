package com.eventhub.eventhub_backend.event.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventMatchRequest {

    @NotBlank(message = "Prompt cannot be blank")
    String prompt;
}
