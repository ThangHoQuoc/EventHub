# ADR-003: Ghi nhận ngữ nghĩa tồn kho trong working tree

## Trạng thái và bối cảnh

Ngày 09/10/2026. **Ghi nhận implementation chưa commit và phân tích hiện tại; không phải quyết định sản phẩm đã được duyệt.** ADR-002 được giữ nguyên như lịch sử giai đoạn booking chưa giữ tồn kho.

## Bằng chứng hiện tại

- BookingServiceImpl.createBooking gọi reserveInventory trong transaction.
- TicketTypeRepository.reserveAvailableQuantity tăng soldQuantity bằng JPQL có điều kiện không vượt quantity.
- cancelBooking/expirePendingBookings trừ soldQuantity qua findByIdForUpdate.
- PaymentServiceImpl.confirmPayment không còn tăng soldQuantity.
- BookingScheduler quét mỗi 60 giây, timeout 900 giây.
- Test mới mang tên createBooking_shouldReserveInventoryForPendingPaymentBooking và confirmPayment_shouldConfirmPendingBookingWithoutChangingReservedInventory.

## Hệ quả

`soldQuantity` đang đếm chỗ đã chiếm, gồm cả pending và confirmed; tên trường không còn có nghĩa chỉ vé bán đã trả tiền. Công thức hiện tại vẫn là quantity - soldQuantity; không có reservedQuantity. Giá trị báo cáo bán hàng không nên lấy trực tiếp soldQuantity rồi gọi là doanh thu hoặc số vé đã thanh toán.

## Phương án và trade-off

Giữ một bộ đếm đơn giản giúp giảm thay đổi schema nhưng gây mơ hồ nghĩa và cần bảo vệ release chỉ một lần. Tách reservedQuantity và soldQuantity làm rõ domain nhưng phải thay đổi schema, chuyển dữ liệu cũ, chuẩn hóa mọi đường chuyển trạng thái và test đồng thời. Tính reservation từ booking tránh bộ đếm trùng nhưng thêm query/index và xử lý hết hạn nhất quán.

**ĐỀ XUẤT:** thống nhất nghĩa bằng test tích hợp trên PostgreSQL trước khi đổi schema. Chưa chọn phương án thay thế trong nhiệm vụ docs. Không coi ADR này là sửa business logic hoặc supersede quyết định đã được duyệt; nó ghi nhận khác biệt để phiên sau không thực hiện tăng tồn kho lần hai ở payment.
