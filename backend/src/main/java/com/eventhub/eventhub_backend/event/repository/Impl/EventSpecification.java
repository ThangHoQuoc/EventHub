package com.eventhub.eventhub_backend.event.repository.Impl;


import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
public class EventSpecification {

    public List<Predicate> buildPredicates(
            CriteriaBuilder cb,
            Root<Event> event,
            EventSearchRequest request
    ) {

        List<Predicate> predicates = new ArrayList<>();

        // Chỉ cho phép public Event
        predicates.add(
                cb.equal(
                        event.get("status"),
                        EventStatus.PUBLISHED
                )
        );

        // Keyword → title OR description
        if (StringUtils.hasText(request.getKeyword())) {

            String keyword =
                    "%" + request.getKeyword().trim().toLowerCase() + "%";

            predicates.add(
                    cb.or(
                            cb.like(
                                    cb.lower(event.get("title")),
                                    keyword
                            ),
                            cb.like(
                                    cb.lower(event.get("description")),
                                    keyword
                            )
                    )
            );
        }

        // Location
        if (StringUtils.hasText(request.getLocation())) {

            String location =
                    "%" + request.getLocation().trim().toLowerCase() + "%";

            predicates.add(
                    cb.like(
                            cb.lower(event.get("location")),
                            location
                    )
            );
        }

        // Category
        if (StringUtils.hasText(request.getCategory())) {

            predicates.add(
                    cb.equal(
                            cb.lower(event.get("category")),
                            request.getCategory().trim().toLowerCase()
                    )
            );
        }

        // Event start >= request.startAt
        if (request.getStartAt() != null) {

            predicates.add(
                    cb.greaterThanOrEqualTo(
                            event.get("startAt"),
                            request.getStartAt()
                    )
            );
        }

        // Event end <= request.endAt
        if (request.getEndAt() != null) {

            predicates.add(
                    cb.lessThanOrEqualTo(
                            event.get("endAt"),
                            request.getEndAt()
                    )
            );
        }

        return predicates;
    }
}
