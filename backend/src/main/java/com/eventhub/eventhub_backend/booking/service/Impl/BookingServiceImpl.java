package com.eventhub.eventhub_backend.booking.service.Impl;

import com.eventhub.eventhub_backend.booking.dto.request.BookingItemRequest;
import com.eventhub.eventhub_backend.booking.dto.request.CreateBookingRequest;
import com.eventhub.eventhub_backend.booking.dto.response.BookingItemResponse;
import com.eventhub.eventhub_backend.booking.dto.response.BookingResponse;
import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingItem;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import com.eventhub.eventhub_backend.booking.repository.BookingRepository;
import com.eventhub.eventhub_backend.booking.service.BookingService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.event.entity.EventStatus;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticket.event.TicketAvailabilityChangedEvent;
import com.eventhub.eventhub_backend.ticket.repository.TicketTypeRepository;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {

        requireCustomer();

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String customerId = currentUserService.getCurrentUserId();
        User customer = userRepository.findById(customerId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Map<String, Integer> requestedQuantities = aggregateRequestedQuantities(request.getItems());

        Booking booking = Booking.builder().customer(customer).status(BookingStatus.PENDING_PAYMENT).totalAmount(BigDecimal.ZERO).build();

        List<BookingItem> items = new ArrayList<>();
        String eventId = null;
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<String, TicketType> ticketTypes = loadTicketTypes(requestedQuantities);

        for (Map.Entry<String, Integer> entry : requestedQuantities.entrySet()) {
            TicketType ticketType = ticketTypes.get(entry.getKey());

            Event event = ticketType.getEvent();
            if (event == null || event.getStatus() != EventStatus.PUBLISHED) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            if (eventId == null) {
                eventId = event.getId();
            } else if (!eventId.equals(event.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            Integer quantity = entry.getValue();
            validateAvailableQuantity(ticketType, quantity);

            BigDecimal subtotal = ticketType.getPrice().multiply(BigDecimal.valueOf(quantity));
            BookingItem item = BookingItem.builder()
                    .booking(booking).
                    ticketType(ticketType)
                    .quantity(quantity)
                    .unitPrice(ticketType.getPrice())
                    .subtotal(subtotal).build();

            items.add(item);
            totalAmount = totalAmount.add(subtotal);
        }

        booking.setItems(items);
        booking.setTotalAmount(totalAmount);

        reserveInventory(requestedQuantities);
        Booking savedBooking = bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    @Override
    public PageResponse<BookingResponse> getMyBookings(Pageable pageable) {

        requireCustomer();

        String customerId = currentUserService.getCurrentUserId();
        Page<BookingResponse> page = bookingRepository.findByCustomerId(customerId, pageable).map(this::toResponse);

        return PageResponse.<BookingResponse>builder().content(page.getContent()).page(page.getNumber()).size(page.getSize()).totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).first(page.isFirst()).last(page.isLast()).build();
    }

    @Override
    public BookingResponse getBooking(String bookingId) {

        requireCustomer();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        validateOwner(booking);

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingId) {

        requireCustomer();

        Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        validateOwner(booking);

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        releaseInventory(booking);
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        return toResponse(booking);
    }

    @Override
    @Transactional
    public int expirePendingBookings(Instant expiresBefore) {
        if (expiresBefore == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING_PAYMENT,
                expiresBefore
        );

        // Khóa hết Booking trước, rồi trả TicketType theo cùng thứ tự ID cho cả batch.
        Map<String, Integer> releasedQuantities = new LinkedHashMap<>();
        for (Booking booking : expiredBookings) {
            aggregateBookedQuantities(booking).forEach((id, quantity) ->
                    releasedQuantities.merge(id, quantity, Integer::sum));
        }
        releaseInventory(releasedQuantities);
        expiredBookings.forEach(booking -> booking.setStatus(BookingStatus.EXPIRED));

        bookingRepository.saveAll(expiredBookings);

        return expiredBookings.size();
    }

    private Map<String, Integer> aggregateRequestedQuantities(List<BookingItemRequest> items) {
        Map<String, Integer> requestedQuantities = new LinkedHashMap<>();

        for (BookingItemRequest item : items) {
            if (item.getTicketTypeId() == null || item.getTicketTypeId().isBlank() || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            requestedQuantities.merge(item.getTicketTypeId(), item.getQuantity(), Integer::sum);
        }

        return requestedQuantities;
    }

    private Map<String, TicketType> loadTicketTypes(Map<String, Integer> requestedQuantities) {
        Map<String, TicketType> ticketTypes = new LinkedHashMap<>();

        requestedQuantities.keySet().stream().sorted().forEach(ticketTypeId -> {
            TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                    .orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));
            ticketTypes.put(ticketTypeId, ticketType);
        });

        return ticketTypes;
    }

    private void validateAvailableQuantity(TicketType ticketType, Integer requestedQuantity) {
        if (ticketType.getQuantity() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
        int availableQuantity = ticketType.getQuantity() - soldQuantity;

        if (requestedQuantity > availableQuantity) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void reserveInventory(Map<String, Integer> requestedQuantities) {
        requestedQuantities.keySet().stream().sorted().forEach(ticketTypeId -> {
            Integer requestedQuantity = requestedQuantities.get(ticketTypeId);
            int updatedRows = ticketTypeRepository.reserveAvailableQuantity(ticketTypeId, requestedQuantity);

            if (updatedRows != 1) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
        });
    }

    private void releaseInventory(Booking booking) {
        releaseInventory(aggregateBookedQuantities(booking));
    }

    private void releaseInventory(Map<String, Integer> bookedQuantities) {
        bookedQuantities.keySet().stream().sorted().forEach(ticketTypeId -> {
            TicketType ticketType = getLockedTicketType(ticketTypeId);
            int soldQuantity = ticketType.getSoldQuantity() == null ? 0 : ticketType.getSoldQuantity();
            int releasedQuantity = bookedQuantities.get(ticketTypeId);

            ticketType.setSoldQuantity(Math.max(0, soldQuantity - releasedQuantity));
            ticketTypeRepository.save(ticketType);
            eventPublisher.publishEvent(new TicketAvailabilityChangedEvent(ticketTypeId));
        });
    }

    private Map<String, Integer> aggregateBookedQuantities(Booking booking) {
        Map<String, Integer> bookedQuantities = new LinkedHashMap<>();

        if (booking.getItems() == null) {
            return bookedQuantities;
        }

        for (BookingItem item : booking.getItems()) {
            if (item.getTicketType() == null || item.getTicketType().getId() == null
                    || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            bookedQuantities.merge(item.getTicketType().getId(), item.getQuantity(), Integer::sum);
        }

        return bookedQuantities;
    }

    private TicketType getLockedTicketType(String ticketTypeId) {
        return ticketTypeRepository.findByIdForUpdate(ticketTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_TYPE_NOT_FOUND));
    }

    private void requireCustomer() {
        if (currentUserService.getCurrentUserRole() != Role.CUSTOMER) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateOwner(Booking booking) {
        if (!currentUserService.getCurrentUserId().equals(booking.getCustomer().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private BookingResponse toResponse(Booking booking) {
        List<BookingItemResponse> items = booking.getItems() == null ? List.of() : booking.getItems().stream().map(this::toItemResponse).toList();

        return BookingResponse.builder().id(booking.getId()).customerId(booking.getCustomer().getId()).status(booking.getStatus()).totalAmount(booking.getTotalAmount()).createdAt(booking.getCreatedAt()).items(items).build();
    }

    private BookingItemResponse toItemResponse(BookingItem item) {
        TicketType ticketType = item.getTicketType();
        Event event = ticketType.getEvent();

        return BookingItemResponse.builder().id(item.getId()).ticketTypeId(ticketType.getId()).ticketTypeName(ticketType.getName()).eventId(event.getId()).eventTitle(event.getTitle()).quantity(item.getQuantity()).unitPrice(item.getUnitPrice()).subtotal(item.getSubtotal()).build();
    }
    @Override
    public PageResponse<BookingResponse> getPendingBookings(Pageable pageable) {
        Page<Booking> page = bookingRepository.findByStatus(BookingStatus.PENDING_PAYMENT, pageable);
        return PageResponse.<BookingResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}