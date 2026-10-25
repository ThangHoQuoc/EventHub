package com.eventhub.eventhub_backend.booking.controller;

import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.ApiResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);

        return ApiResponse.<BookingResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Booking created successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ApiResponse<PageResponse<BookingResponse>> getMyBookings(Pageable pageable) {
        PageResponse<BookingResponse> response = bookingService.getMyBookings(pageable);

        return ApiResponse.<PageResponse<BookingResponse>>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Bookings retrieved successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ApiResponse<PageResponse<BookingResponse>> getPendingBookings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<BookingResponse> response = bookingService.getPendingBookings(pageable);
        return ApiResponse.<PageResponse<BookingResponse>>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Pending bookings retrieved successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{bookingId}")
    public ApiResponse<BookingResponse> getBooking(@PathVariable String bookingId) {
        BookingResponse response = bookingService.getBooking(bookingId);

        return ApiResponse.<BookingResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Booking retrieved successfully")
                .result(response)
                .build();
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PatchMapping("/{bookingId}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(@PathVariable String bookingId) {
        BookingResponse response = bookingService.cancelBooking(bookingId);

        return ApiResponse.<BookingResponse>builder()
                .code(ErrorCode.SUCCESS.getCode())
                .message("Booking cancelled successfully")
                .result(response)
                .build();
    }
}
