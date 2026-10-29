package com.eventhub.eventhub_backend.payment.service.Impl;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.payment.config.VNPayConfig;
import com.eventhub.eventhub_backend.payment.dto.request.ConfirmPaymentRequest;
import com.eventhub.eventhub_backend.payment.dto.request.CreatePaymentUrlRequest;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentResponse;
import com.eventhub.eventhub_backend.payment.dto.response.PaymentUrlResponse;
import com.eventhub.eventhub_backend.payment.entity.Payment;
import com.eventhub.eventhub_backend.payment.entity.PaymentStatus;
import com.eventhub.eventhub_backend.payment.repository.PaymentRepository;
import com.eventhub.eventhub_backend.payment.service.PaymentService;
import com.eventhub.eventhub_backend.notification.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import com.eventhub.eventhub_backend.ticketing.service.TicketService;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {

    BookingRepository bookingRepository;
    PaymentRepository paymentRepository;
    TicketService ticketService;
    VNPayConfig vnpayConfig;
    CurrentUserService currentUserService;
    EmailService emailService;

    @Override
    @Transactional
    public PaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        validateRequest(request);

        Booking booking = bookingRepository.findByIdForUpdate(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Optional<Payment> existingPayment = paymentRepository.findByProviderAndProviderTransactionId(
                request.getProvider(), request.getProviderTransactionId());

        if (existingPayment.isPresent()) {
            return handleExistingPayment(existingPayment.get(), request);
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

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
        List<TicketResponse> issuedTickets = ticketService.issueTicketsForBooking(booking);
        if (emailService != null) {
            try {
                emailService.sendTicketConfirmationEmail(booking, issuedTickets);
            } catch (Exception e) {
                log.warn("Could not dispatch ticket confirmation email for booking {}: {}", booking.getId(), e.getMessage());
            }
        }

        return toResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentUrlResponse createPaymentUrl(CreatePaymentUrlRequest request, String ipAddress) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Kiểm tra quyền sở hữu đơn hàng
        String currentUserId = currentUserService.getCurrentUserId();
        Role currentUserRole = currentUserService.getCurrentUserRole();
        if (currentUserRole != Role.ADMIN && !currentUserId.equals(booking.getCustomer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        long amount = booking.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", VNPayConfig.VNP_VERSION);
        vnpParams.put("vnp_Command", VNPayConfig.VNP_COMMAND);
        vnpParams.put("vnp_TmnCode", vnpayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", VNPayConfig.VNP_CURR_CODE);
        vnpParams.put("vnp_TxnRef", booking.getId());
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve EventHub - Ma don " + booking.getId());
        vnpParams.put("vnp_OrderType", VNPayConfig.VNP_ORDER_TYPE);
        vnpParams.put("vnp_Locale", VNPayConfig.VNP_LOCALE);
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", (StringUtils.hasText(ipAddress)) ? ipAddress : "127.0.0.1");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        vnpParams.put("vnp_CreateDate", formatter.format(Instant.now()));
        vnpParams.put("vnp_ExpireDate", formatter.format(Instant.now().plusSeconds(900)));

        if (StringUtils.hasText(request.getBankCode())) {
            vnpParams.put("vnp_BankCode", request.getBankCode().trim());
        }

        String secureHash = vnpayConfig.hashAllFields(vnpParams);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder query = new StringBuilder();
        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext(); ) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if (StringUtils.hasText(fieldValue)) {
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append("&");
                }
            }
        }

        String paymentUrl = vnpayConfig.getVnpPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .bookingId(booking.getId())
                .provider("VNPAY")
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse processVNPayCallback(Map<String, String> queryParams) {
        String vnpSecureHash = queryParams.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String expectedHash = vnpayConfig.hashAllFields(fields);
        if (!expectedHash.equalsIgnoreCase(vnpSecureHash)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        String bookingId = queryParams.get("vnp_TxnRef");
        String transactionNo = queryParams.get("vnp_TransactionNo");

        if (!"00".equals(responseCode)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        ConfirmPaymentRequest confirmRequest = ConfirmPaymentRequest.builder()
                .bookingId(bookingId)
                .provider("VNPAY")
                .providerTransactionId(StringUtils.hasText(transactionNo) ? transactionNo : "VNP-" + bookingId)
                .build();

        return confirmPayment(confirmRequest);
    }

    @Override
    @Transactional
    public Map<String, String> processVNPayIPN(Map<String, String> queryParams) {
        Map<String, String> response = new HashMap<>();
        String vnpSecureHash = queryParams.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String expectedHash = vnpayConfig.hashAllFields(fields);
        if (!expectedHash.equalsIgnoreCase(vnpSecureHash)) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return response;
        }

        String bookingId = queryParams.get("vnp_TxnRef");
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            response.put("RspCode", "01");
            response.put("Message", "Order not Found");
            return response;
        }

        Booking booking = bookingOpt.get();
        long vnpAmount = Long.parseLong(queryParams.get("vnp_Amount"));
        long expectedAmount = booking.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        if (vnpAmount != expectedAmount) {
            response.put("RspCode", "04");
            response.put("Message", "Invalid Amount");
            return response;
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            response.put("RspCode", "02");
            response.put("Message", "Order already confirmed");
            return response;
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        String transactionNo = queryParams.get("vnp_TransactionNo");

        if ("00".equals(responseCode)) {
            confirmPayment(ConfirmPaymentRequest.builder()
                    .bookingId(bookingId)
                    .provider("VNPAY")
                    .providerTransactionId(StringUtils.hasText(transactionNo) ? transactionNo : "VNP-" + bookingId)
                    .build());
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        } else {
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success (Transaction failed recorded)");
        }

        return response;
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
