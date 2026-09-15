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
public class EventSearchRequest {

    String keyword;

    String location;

    String category;

    Instant startAt;

    Instant endAt;

}