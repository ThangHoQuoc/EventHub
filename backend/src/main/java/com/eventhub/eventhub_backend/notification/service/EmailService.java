package com.eventhub.eventhub_backend.notification.service;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;

import java.util.List;

public interface EmailService {

    /**
     * Gửi email xác nhận đặt vé thành công kèm danh sách vé điện tử và mã QR.
     *
     * @param booking Đơn đặt chỗ đã thanh toán
     * @param tickets Danh sách vé đã phát hành
     */
    void sendTicketConfirmationEmail(Booking booking, List<TicketResponse> tickets);

    /**
     * Gửi email thông báo có suất mua vé từ danh sách chờ (Waitlist Offer).
     *
     * @param offer Suất mời mua vé
     */
    void sendWaitlistOfferEmail(WaitlistOffer offer);

    /**
     * Gửi lại email cho một vé điện tử cụ thể.
     *
     * @param ticket Thực thể vé điện tử
     */
    void sendSingleTicketEmail(Ticket ticket);
}
