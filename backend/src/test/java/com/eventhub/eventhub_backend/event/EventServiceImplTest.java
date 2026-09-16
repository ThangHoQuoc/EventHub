package com.eventhub.eventhub_backend.event;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.mapper.EventMapper;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.Impl.EventServiceImpl;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final EventMapper eventMapper = Mappers.getMapper(EventMapper.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);

    private final EventServiceImpl eventService = new EventServiceImpl(
            eventRepository,
            userRepository,
            eventMapper,
            currentUserService
    );

    @Test
    void updateEvent_shouldPatchDraftEventForOwner() {
        Event event = createEvent(EventStatus.DRAFT);

        UpdateEventRequest request = UpdateEventRequest.builder()
                .title("Java Workshop Updated")
                .startAt(Instant.now().plusSeconds(7200))
                .endAt(Instant.now().plusSeconds(10800))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));

        EventResponse response = eventService.updateEvent("event-1", request);

        assertThat(response.getTitle()).isEqualTo("Java Workshop Updated");
        assertThat(response.getDescription()).isEqualTo("Original description");
        assertThat(response.getOrganizerId()).isEqualTo("organizer-1");
        verify(eventRepository).save(event);
    }

    @Test
    void updateEvent_shouldAllowOnlySafeFieldsForPublishedEvent() {
        Event event = createEvent(EventStatus.PUBLISHED);
        Instant originalStartAt = event.getStartAt();
        Instant originalEndAt = event.getEndAt();

        UpdateEventRequest request = UpdateEventRequest.builder()
                .title("Published title updated")
                .description("Published description updated")
                .location("Ho Chi Minh City")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));

        EventResponse response = eventService.updateEvent("event-1", request);

        assertThat(response.getTitle()).isEqualTo("Published title updated");
        assertThat(response.getDescription()).isEqualTo("Published description updated");
        assertThat(response.getLocation()).isEqualTo("Ho Chi Minh City");
        assertThat(response.getStartAt()).isEqualTo(originalStartAt);
        assertThat(response.getEndAt()).isEqualTo(originalEndAt);
        verify(eventRepository).save(event);
    }

    @Test
    void updateEvent_shouldRejectTimeChangeForPublishedEvent() {
        Event event = createEvent(EventStatus.PUBLISHED);

        UpdateEventRequest request = UpdateEventRequest.builder()
                .startAt(Instant.now().plusSeconds(7200))
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.updateEvent("event-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REQUEST);

        verify(eventRepository, never()).save(event);
    }

    @Test
    void updateEvent_shouldRejectCompletedEvent() {
        Event event = createEvent(EventStatus.COMPLETED);

        UpdateEventRequest request = UpdateEventRequest.builder()
                .title("Completed event update")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-1");
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.updateEvent("event-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.EVENT_CANNOT_BE_UPDATED);

        verify(eventRepository, never()).save(event);
    }

    @Test
    void updateEvent_shouldRejectOrganizerWithoutOwnership() {
        Event event = createEvent(EventStatus.DRAFT);

        UpdateEventRequest request = UpdateEventRequest.builder()
                .title("Wrong owner update")
                .build();

        when(currentUserService.getCurrentUserRole()).thenReturn(Role.ORGANIZER);
        when(currentUserService.getCurrentUserId()).thenReturn("organizer-2");
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.updateEvent("event-1", request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(eventRepository, never()).save(event);
    }

    private Event createEvent(EventStatus status) {
        User organizer = User.builder()
                .build();
        organizer.setId("organizer-1");

        Event event = Event.builder()
                .title("Java Workshop")
                .description("Original description")
                .thumbnailUrl("https://example.com/thumbnail.jpg")
                .location("Da Nang")
                .startAt(Instant.now().plusSeconds(3600))
                .endAt(Instant.now().plusSeconds(5400))
                .status(status)
                .organizer(organizer)
                .build();
        event.setId("event-1");

        return event;
    }
}
