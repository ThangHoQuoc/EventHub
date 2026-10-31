package com.eventhub.eventhub_backend.event.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExtractedPreferencesDto {

    String city;
    String category;
    BigDecimal maxPrice;
    String timeRange;
    String rawPrompt;
}
