package com.eventhub.eventhub_backend.event.mapper;


import com.eventhub.eventhub_backend.event.dto.request.CreateEventRequest;
import com.eventhub.eventhub_backend.event.dto.request.UpdateEventRequest;
import com.eventhub.eventhub_backend.event.dto.response.EventResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EventMapper {

    Event toEntity(CreateEventRequest request);

    @Mapping(source = "organizer.id", target = "organizerId")
    EventResponse toResponse(Event event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateEventRequest request, @MappingTarget Event event);

}