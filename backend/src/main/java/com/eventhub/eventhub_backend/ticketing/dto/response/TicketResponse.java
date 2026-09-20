package com.eventhub.eventhub_backend.ticketing.dto.response;

import com.eventhub.eventhub_backend.ticketing.entity.TicketStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {

    String id;
    String ticketCode;
    String qrPayload;
    TicketStatus status;
    String bookingId;
    String customerId;
    String ticketTypeId;
    String ticketTypeName;
    String eventId;
    String eventTitle;
    Instant issuedAt;
    Instant checkedInAt;
}
