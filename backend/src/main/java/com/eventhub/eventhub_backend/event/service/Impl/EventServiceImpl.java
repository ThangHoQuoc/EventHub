package com.eventhub.eventhub_backend.event.service.Impl;

import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.event.mapper.EventMapper;
import com.eventhub.eventhub_backend.event.repository.EventRepository;
import com.eventhub.eventhub_backend.event.service.EventService;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;
    private final CurrentUserService currentUserService;

    @Override
    public EventResponse createEvent(CreateEventRequest request, String organizerId) {

        if (!request.getStartAt().isBefore(request.getEndAt())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User organizer = userRepository.findById(organizerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Event event = eventMapper.toEntity(request);

        event.setOrganizer(organizer);
        event.setStatus(EventStatus.DRAFT);

        event = eventRepository.save(event);

        return eventMapper.toResponse(event);
    }

    @Override
    public PageResponse<EventResponse> getEvents(EventSearchRequest request, Pageable pageable) {

        Page<Event> page = eventRepository.searchEvents(request, pageable);

        return PageResponse.<EventResponse>builder().content(page.map(eventMapper::toResponse).getContent()).page(page.getNumber()).size(page.getSize()).totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).first(page.isFirst()).last(page.isLast()).build();
    }

    @Override
    public PageResponse<EventResponse> getPublishedEvents(Pageable pageable) {

        Page<EventResponse> page = eventRepository.findByStatus(EventStatus.PUBLISHED, pageable).map(eventMapper::toResponse);

        return PageResponse.<EventResponse>builder().content(page.getContent()).page(page.getNumber()).size(page.getSize()).totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).first(page.isFirst()).last(page.isLast()).build();
    }

    @Override
    public EventResponse updateEvent(String eventId, UpdateEventRequest request) {


        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        Role role = currentUserService.getCurrentUserRole();
        if (role == Role.ORGANIZER && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getStatus().equals(EventStatus.CANCELLED) || event.getStatus().equals(EventStatus.COMPLETED)) {
            throw new AppException(ErrorCode.EVENT_CANNOT_BE_UPDATED);
        }

        if (event.getStatus() == EventStatus.PUBLISHED) {
            if (request.getThumbnailUrl() != null || request.getStartAt() != null || request.getEndAt() != null) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            if (request.getTitle() != null) {
                event.setTitle(request.getTitle());
            }

            if (request.getDescription() != null) {
                event.setDescription(request.getDescription());
            }

            if (request.getLocation() != null) {
                event.setLocation(request.getLocation());
            }

        } else {
            Instant startAt = request.getStartAt() != null ? request.getStartAt() : event.getStartAt();

            Instant endAt = request.getEndAt() != null ? request.getEndAt() : event.getEndAt();

            if (!startAt.isBefore(endAt)) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            if (!startAt.isAfter(Instant.now())) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            eventMapper.updateEntity(request, event);
        }

        eventRepository.save(event);

        return eventMapper.toResponse(event);

    }

    @Override
    public EventResponse publishEvent(String eventId) {

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new AppException(ErrorCode.EVENT_CANNOT_BE_UPDATED);
        }

        if (!StringUtils.hasText(event.getTitle()) || !StringUtils.hasText(event.getDescription()) || !StringUtils.hasText(event.getLocation()) || event.getStartAt() == null || event.getEndAt() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (!event.getStartAt().isBefore(event.getEndAt()) || !event.getStartAt().isAfter(Instant.now())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Role role = currentUserService.getCurrentUserRole();

        if (role == Role.ORGANIZER && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        event.setStatus(EventStatus.PUBLISHED);

        eventRepository.save(event);

        return eventMapper.toResponse(event);
    }

    @Override
    public EventResponse cancelEvent(String eventId) {

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        Role role = currentUserService.getCurrentUserRole();

        if (role == Role.ORGANIZER && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.COMPLETED) {
            throw new AppException(ErrorCode.EVENT_CANNOT_BE_UPDATED);
        }

        event.setStatus(EventStatus.CANCELLED);

        eventRepository.save(event);

        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional
    public void completeExpiredEvents() {

        List<Event> events = eventRepository.findByStatusAndEndAtBefore(EventStatus.PUBLISHED, Instant.now());

        events.forEach(event -> event.setStatus(EventStatus.COMPLETED));

        if (!events.isEmpty()) {
            eventRepository.saveAll(events);
        }
    }

    @Override
    public EventResponse getEvent(String eventId) {

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        Role role = currentUserService.getCurrentUserRole();

        if (role == Role.CUSTOMER && event.getStatus() != EventStatus.PUBLISHED) {
            throw new AppException(ErrorCode.EVENT_NOT_FOUND);
        }

        if (role == Role.ORGANIZER && !currentUserService.getCurrentUserId().equals(event.getOrganizer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (role != Role.ADMIN && role != Role.ORGANIZER && role != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return eventMapper.toResponse(event);
    }


}


