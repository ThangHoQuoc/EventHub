package com.eventhub.eventhub_backend.booking.repository;

import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingItemRepository extends JpaRepository<BookingItem, String> {
}
