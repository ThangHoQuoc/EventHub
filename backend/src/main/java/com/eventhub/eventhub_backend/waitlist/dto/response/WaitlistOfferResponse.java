package com.eventhub.eventhub_backend.waitlist.dto.response;

import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOfferStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WaitlistOfferResponse {

    String id;
    String waitlistEntryId;
    String customerId;
    String ticketTypeId;
    String ticketTypeName;
    String eventId;
    String eventTitle;
    Integer quantity;
    WaitlistOfferStatus status;
    Instant expiresAt;
    Instant acceptedAt;
    Instant createdAt;
}
