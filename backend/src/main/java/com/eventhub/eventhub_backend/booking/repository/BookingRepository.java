package com.eventhub.eventhub_backend.booking.repository;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.booking.entity.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, String> {

    Page<Booking> findByCustomerId(String customerId, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.status = :status and b.createdAt < :createdAt order by b.id")
    List<Booking> findByStatusAndCreatedAtBefore(@Param("status") BookingStatus status,
                                                @Param("createdAt") Instant createdAt);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(i.subtotal), 0) FROM BookingItem i WHERE i.ticketType.event.id = :eventId AND i.booking.status = :status")
    BigDecimal sumRevenueByEventIdAndBookingStatus(@Param("eventId") String eventId, @Param("status") BookingStatus status);
}
