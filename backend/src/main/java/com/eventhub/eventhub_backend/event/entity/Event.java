package com.eventhub.eventhub_backend.event.entity;

import com.eventhub.eventhub_backend.common.entity.BaseEntity;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "events")
public class Event extends BaseEntity {

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    String thumbnailUrl;

    String category;

    @Column(nullable = false)
    String location;

    @Column(nullable = false)
    Instant startAt;

    @Column(nullable = false)
    Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    EventStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    User organizer;

    @OneToMany(mappedBy = "event")
    private List<TicketType> ticketTypes;
}
