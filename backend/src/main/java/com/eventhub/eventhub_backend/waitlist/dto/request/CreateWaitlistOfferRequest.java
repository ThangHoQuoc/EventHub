package com.eventhub.eventhub_backend.waitlist.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateWaitlistOfferRequest {

    @NotBlank(message = "Waitlist entry id is required")
    String waitlistEntryId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    Integer quantity;

    @NotNull(message = "Expires at is required")
    @Future(message = "Expires at must be in the future")
    Instant expiresAt;
}
