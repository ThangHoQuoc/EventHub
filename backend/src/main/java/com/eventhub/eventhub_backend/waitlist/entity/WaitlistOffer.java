package com.eventhub.eventhub_backend.waitlist.entity;

import com.eventhub.eventhub_backend.common.entity.BaseEntity;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "waitlist_offers")
public class WaitlistOffer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waitlist_entry_id", nullable = false)
    WaitlistEntry waitlistEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    TicketType ticketType;

    @Column(nullable = false)
    Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    WaitlistOfferStatus status;

    @Column(nullable = false)
    Instant expiresAt;

    Instant acceptedAt;

    String convertedBookingId;
}
