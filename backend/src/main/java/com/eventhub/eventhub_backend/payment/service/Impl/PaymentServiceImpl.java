package com.eventhub.eventhub_backend.payment.service.Impl;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.entity.Payment;
import com.eventhub.eventhub_backend.payment.entity.PaymentStatus;
import com.eventhub.eventhub_backend.payment.repository.PaymentRepository;
import com.eventhub.eventhub_backend.payment.service.PaymentService;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;

    @Override
    @Transactional
    public PaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        validateRequest(request);

        // Khóa trước lookup: retry đang chờ phải đọc payment sau khi lần đầu commit.
        Booking booking = bookingRepository.findByIdForUpdate(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Optional<Payment> existingPayment = paymentRepository.findByProviderAndProviderTransactionId(request.getProvider(), request.getProviderTransactionId());

        if (existingPayment.isPresent()) {
            return handleExistingPayment(existingPayment.get(), request);
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment payment = Payment.builder().booking(booking).amount(booking.getTotalAmount()).status(PaymentStatus.SUCCESS).provider(request.getProvider()).providerTransactionId(request.getProviderTransactionId()).paidAt(Instant.now()).build();

        Payment savedPayment = paymentRepository.save(payment);
        ticketService.issueTicketsForBooking(booking);

        return toResponse(savedPayment);
    }

    private void validateRequest(ConfirmPaymentRequest request) {
        if (request == null || !StringUtils.hasText(request.getBookingId()) || !StringUtils.hasText(request.getProvider()) || !StringUtils.hasText(request.getProviderTransactionId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private PaymentResponse handleExistingPayment(Payment payment, ConfirmPaymentRequest request) {
        if (!request.getBookingId().equals(payment.getBooking().getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder().id(payment.getId()).bookingId(payment.getBooking().getId()).amount(payment.getAmount()).status(payment.getStatus()).provider(payment.getProvider()).providerTransactionId(payment.getProviderTransactionId()).paidAt(payment.getPaidAt()).bookingStatus(payment.getBooking().getStatus()).build();
    }
}
