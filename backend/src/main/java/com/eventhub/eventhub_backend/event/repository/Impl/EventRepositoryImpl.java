package com.eventhub.eventhub_backend.event.repository.Impl;


import com.eventhub.eventhub_backend.event.dto.request.EventSearchRequest;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.repository.EventRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EventRepositoryImpl implements EventRepositoryCustom {

    private final EntityManager entityManager;
    private final EventSpecification eventSpecification;

    @Override
    public Page<Event> searchEvents(
            EventSearchRequest request,
            Pageable pageable
    ) {

        CriteriaBuilder cb =
                entityManager.getCriteriaBuilder();

        CriteriaQuery<Event> query =
                cb.createQuery(Event.class);

        Root<Event> event =
                query.from(Event.class);

        query.where(
                cb.and(
                        eventSpecification
                                .buildPredicates(cb, event, request)
                                .toArray(new jakarta.persistence.criteria.Predicate[0])
                )
        );

        applySorting(cb, query, event, pageable);

        TypedQuery<Event> typedQuery =
                entityManager.createQuery(query);

        typedQuery.setFirstResult(
                (int) pageable.getOffset()
        );

        typedQuery.setMaxResults(
                pageable.getPageSize()
        );

        List<Event> events =
                typedQuery.getResultList();

        long total = countEvents(request);

        return new PageImpl<>(
                events,
                pageable,
                total
        );
    }

    private void applySorting(
            CriteriaBuilder cb,
            CriteriaQuery<Event> query,
            Root<Event> event,
            Pageable pageable
    ) {

        if (!pageable.getSort().isSorted()) {
            return;
        }

        List<jakarta.persistence.criteria.Order> orders =
                new ArrayList<>();

        for (Sort.Order sort : pageable.getSort()) {

            if (sort.isAscending()) {
                orders.add(
                        cb.asc(event.get(sort.getProperty()))
                );
            } else {
                orders.add(
                        cb.desc(event.get(sort.getProperty()))
                );
            }
        }

        query.orderBy(orders);
    }

    private long countEvents(
            EventSearchRequest request
    ) {

        CriteriaBuilder cb =
                entityManager.getCriteriaBuilder();

        CriteriaQuery<Long> query =
                cb.createQuery(Long.class);

        Root<Event> event =
                query.from(Event.class);

        query.select(cb.count(event));

        query.where(
                cb.and(
                        eventSpecification
                                .buildPredicates(cb, event, request)
                                .toArray(new jakarta.persistence.criteria.Predicate[0])
                )
        );

        return entityManager
                .createQuery(query)
                .getSingleResult();
    }
}