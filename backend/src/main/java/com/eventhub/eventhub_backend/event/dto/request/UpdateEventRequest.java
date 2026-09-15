package com.eventhub.eventhub_backend.event.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateEventRequest {


    String title;

    String description;

    String thumbnailUrl;

    String location;

    Instant startAt;

    Instant endAt;

}
