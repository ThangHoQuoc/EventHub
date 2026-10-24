# Luồng nghiệp vụ lớn

## Đặt, trả tiền và phát hành

![Mua vé](../assets/diagrams/rendered/purchase.svg)

1. CUSTOMER gửi CreateBookingRequest; service gộp item cùng ticketTypeId, kiểm tra event PUBLISHED và cùng một event.
2. Giá lấy từ TicketType, lưu unitPrice/subtotal và totalAmount. Không nhận tổng tiền do client tự quyết.
3. `reserveAvailableQuantity` tăng soldQuantity có điều kiện. Nếu bất kỳ item không đủ chỗ, AppException khiến toàn bộ transaction rollback.
4. ADMIN confirm: kiểm tra transaction reference đã có chưa, booking phải pending, ghi CONFIRMED/SUCCESS và gọi issueTicketsForBooking. Payment không tăng soldQuantity nữa.
5. TicketService tạo một vé mỗi đơn vị, mã dựa booking ID và sequence. Người tổ chức sở hữu event hoặc ADMIN check-in vé VALID thành USED.

Nguồn: BookingServiceImpl.createBooking, PaymentServiceImpl.confirmPayment, TicketServiceImpl.issueTicketsForBooking/checkInTicket; link tại [module index](module-index.md). Không có lời gọi ngân hàng trong hình.

## Quá hạn và hủy

BookingScheduler truyền `now - 900 giây`; repository khóa các pending có createdAt trước ngưỡng theo ID. Service gộp lượng trả của batch, khóa TicketType theo ID rồi chuyển EXPIRED. Hủy bởi chủ booking cũng khóa Booking trước và chỉ nhận PENDING_PAYMENT. Confirm dùng cùng khóa Booking, nên các transition tranh chấp được tuần tự hóa; xem [ADR-005](../decisions/ADR-005-booking-and-checkin-concurrency.md) và [test PostgreSQL](../project/concurrency-verification.md).

## Waitlist

Join khi quantity - soldQuantity ≤ 0, dưới khóa TicketType. Booking trả chỗ phát sự kiện; listener AFTER_COMMIT mở transaction mới cấp offer cho WAITING cũ nhất đủ budget (available trừ CREATED offers), hòa thời điểm theo ID. Skip/expiry cũng kích hoạt cấp tiếp; job 60 giây đối soát phục hồi. Accept khóa Type rồi Offer, tạo Booking qua reserve; offer chưa reserve. Xem [ADR-006](../decisions/ADR-006-waitlist-runtime-and-offer-transitions.md).