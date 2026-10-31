package com.eventhub.eventhub_backend.event.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MatchedEventItemDto {

    String id;
    String title;
    String description;
    String thumbnailUrl;
    String category;
    String location;
    String city;
    Instant startAt;
    Instant endAt;
    BigDecimal minPrice;
    Integer availableQuantity;
    Integer matchScore;
    String matchReason;
    List<String> tags;
}
