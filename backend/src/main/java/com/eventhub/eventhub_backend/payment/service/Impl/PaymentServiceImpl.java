package com.eventhub.eventhub_backend.payment.service.Impl;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
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
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketService ticketService;

    @Override
    @Transactional
    public PaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        validateRequest(request);

        Optional<Payment> existingPayment = paymentRepository.findByProviderAndProviderTransactionId(
                request.getProvider(),
                request.getProviderTransactionId()
        );

        if (existingPayment.isPresent()) {
            return handleExistingPayment(existingPayment.get(), request);
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<TicketType> confirmedTicketTypes = confirmInventory(booking);
        ticketTypeRepository.saveAll(confirmedTicketTypes);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.SUCCESS)
                .provider(request.getProvider())
                .providerTransactionId(request.getProviderTransactionId())
                .paidAt(Instant.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        ticketService.issueTicketsForBooking(booking);

        return toResponse(savedPayment);
    }

    private void validateRequest(ConfirmPaymentRequest request) {
        if (request == null
                || !StringUtils.hasText(request.getBookingId())
                || !StringUtils.hasText(request.getProvider())
                || !StringUtils.hasText(request.getProviderTransactionId())) {
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

    private List<TicketType> confirmInventory(Booking booking) {
        if (booking.getItems() == null || booking.getItems().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Map<String, BookingItem> itemByTicketTypeId = new LinkedHashMap<>();
        Map<String, Integer> quantityByTicketTypeId = new LinkedHashMap<>();

        for (BookingItem item : booking.getItems()) {
            TicketType ticketType = item.getTicketType();
            if (ticketType == null || !StringUtils.hasText(ticketType.getId())
                    || ticketType.getQuantity() == null
                    || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            itemByTicketTypeId.putIfAbsent(ticketType.getId(), item);
            quantityByTicketTypeId.merge(ticketType.getId(), item.getQuantity(), Integer::sum);
        }

        for (Map.Entry<String, Integer> entry : quantityByTicketTypeId.entrySet()) {
            TicketType ticketType = itemByTicketTypeId.get(entry.getKey()).getTicketType();
            int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
            int availableQuantity = ticketType.getQuantity() - soldQuantity;

            if (entry.getValue() > availableQuantity) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        }

        List<TicketType> confirmedTicketTypes = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : quantityByTicketTypeId.entrySet()) {
            TicketType ticketType = itemByTicketTypeId.get(entry.getKey()).getTicketType();
            int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
            ticketType.setSoldQuantity(soldQuantity + entry.getValue());
            confirmedTicketTypes.add(ticketType);
        }

        return confirmedTicketTypes;
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .provider(payment.getProvider())
                .providerTransactionId(payment.getProviderTransactionId())
                .paidAt(payment.getPaidAt())
                .bookingStatus(payment.getBooking().getStatus())
                .build();
    }
}
