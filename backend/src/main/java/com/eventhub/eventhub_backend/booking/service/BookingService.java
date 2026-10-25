package com.eventhub.eventhub_backend.booking.service;

import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    PageResponse<BookingResponse> getMyBookings(Pageable pageable);

    BookingResponse getBooking(String bookingId);

    BookingResponse cancelBooking(String bookingId);

    int expirePendingBookings(Instant expiresBefore);

    PageResponse<BookingResponse> getPendingBookings(Pageable pageable);
}
