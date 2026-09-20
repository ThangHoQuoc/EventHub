package com.eventhub.eventhub_backend.ticketing.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckInTicketRequest {

    String ticketCode;
    String qrPayload;
}
