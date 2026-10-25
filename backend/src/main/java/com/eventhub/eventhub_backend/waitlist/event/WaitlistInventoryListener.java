package com.eventhub.eventhub_backend.waitlist.event;

import com.eventhub.eventhub_backend.ticket.event.TicketAvailabilityChangedEvent;
import com.eventhub.eventhub_backend.waitlist.service.WaitlistOfferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaitlistInventoryListener {
    private final WaitlistOfferService waitlistOfferService;

    @TransactionalEventListener
    public void onAvailabilityChanged(TicketAvailabilityChangedEvent event) {
        try {
            // Bean được gọi mở REQUIRES_NEW: transaction phát sự kiện đã commit.
            waitlistOfferService.offerAvailableEntries(event.ticketTypeId());
        } catch (RuntimeException failure) {
            // Booking đã commit; đối soát định kỳ sẽ thử lại thay vì báo hủy booking thất bại.
            log.warn("Waitlist dispatch failed for ticket type {}; scheduler will retry", event.ticketTypeId(), failure);
        }
    }
}
