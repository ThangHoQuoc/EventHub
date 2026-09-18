package com.eventhub.eventhub_backend.event.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateEventRequest {

    @NotBlank
    String title;

    @NotBlank
    String description;

    String thumbnailUrl;

    String category;

    @NotBlank
    String location;

    @NotNull
    @Future
    Instant startAt;

    @NotNull
    @Future
    Instant endAt;
}
