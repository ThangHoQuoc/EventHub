package com.eventhub.eventhub_backend.config;

import com.eventhub.eventhub_backend.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private static final long PAYMENT_TIMEOUT_SECONDS = 900;

    private final BookingService bookingService;

    @Scheduled(fixedRate = 60000)
    public void expirePendingBookings() {
        bookingService.expirePendingBookings(Instant.now().minusSeconds(PAYMENT_TIMEOUT_SECONDS));
    }
}
