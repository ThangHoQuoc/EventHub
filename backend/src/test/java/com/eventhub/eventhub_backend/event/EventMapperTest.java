package com.eventhub.eventhub_backend.event;

import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.mapper.EventMapper;
import com.eventhub.eventhub_backend.user.entity.User;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class EventMapperTest {

    private final EventMapper eventMapper = Mappers.getMapper(EventMapper.class);

    @Test
    void toEntity_shouldMapCategoryFromCreateRequest() {
        CreateEventRequest request = CreateEventRequest.builder()
                .title("Java Workshop")
                .description("Backend workshop")
                .thumbnailUrl("https://example.com/thumbnail.jpg")
                .category("WORKSHOP")
                .location("Da Nang")
                .startAt(Instant.now().plusSeconds(3600))
                .endAt(Instant.now().plusSeconds(7200))
                .build();

        Event event = eventMapper.toEntity(request);

        assertThat(event.getCategory()).isEqualTo("WORKSHOP");
    }

    @Test
    void toResponse_shouldExposeCategory() {
        User organizer = User.builder()
                .build();
        organizer.setId("organizer-1");

        Event event = Event.builder()
                .title("Java Workshop")
                .description("Backend workshop")
                .thumbnailUrl("https://example.com/thumbnail.jpg")
                .category("WORKSHOP")
                .location("Da Nang")
                .startAt(Instant.now().plusSeconds(3600))
                .endAt(Instant.now().plusSeconds(7200))
                .status(EventStatus.PUBLISHED)
                .organizer(organizer)
                .build();

        EventResponse response = eventMapper.toResponse(event);

        assertThat(response.getCategory()).isEqualTo("WORKSHOP");
        assertThat(response.getOrganizerId()).isEqualTo("organizer-1");
    }

    @Test
    void updateEntity_shouldKeepCategoryWhenRequestCategoryIsNull() {
        Event event = Event.builder()
                .title("Java Workshop")
                .category("WORKSHOP")
                .build();

        UpdateEventRequest request = UpdateEventRequest.builder()
                .title("Java Workshop Updated")
                .build();

        eventMapper.updateEntity(request, event);

        assertThat(event.getTitle()).isEqualTo("Java Workshop Updated");
        assertThat(event.getCategory()).isEqualTo("WORKSHOP");
    }
}
