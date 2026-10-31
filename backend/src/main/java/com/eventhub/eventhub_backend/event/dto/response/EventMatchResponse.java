package com.eventhub.eventhub_backend.event.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventMatchResponse {

    ExtractedPreferencesDto parsedPreferences;
    List<MatchedEventItemDto> matches;
    int totalFound;
}
