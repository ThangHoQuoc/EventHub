# ADR-006: Cấp offer sau commit và tuần tự hóa Waitlist theo TicketType

## Trạng thái

Đã triển khai trong working tree ngày 19/10/2026; chưa commit.

## Bối cảnh

Waitlist đã có join/offer/accept/skip/expiry nhưng chưa nối sau trả chỗ. Exists-then-save
không ngăn hai worker tạo trùng; accept/skip/expiry đọc rồi ghi không khóa có thể
ghi đè trạng thái hoặc tạo hai booking. Accept quá hạn ghi EXPIRED rồi throw
RuntimeException khiến transaction rollback thay đổi hết hạn.

## Quyết định

1. Giữ offer không reserve như implementation cũ. Người mua thường vẫn có thể lấy
   chỗ; accept phải đi qua Booking reserve và có thể thất bại vì hết chỗ. Khi cấp,
   ngân sách offer = `quantity - soldQuantity - SUM(quantity của CREATED offers)`.
   Offer hết hạn nhưng chưa được chuyển trạng thái vẫn tính ngân sách đến khi job xử lý.
2. Tất cả đường join/cấp/chuyển trạng thái waitlist lấy khóa TicketType trước;
   transition lấy khóa Offer sau đó. Query metadata chỉ lấy ID trước khóa để tránh
   nạp entity stale. Lựa chọn FIFO eligible có tie-break ID; không hứa strict FIFO.
3. Không đổi bảng/counter. Khóa chung bảo vệ các đường service; SQL hoặc repository
   ghi trực tiếp ngoài service không được xem là đã tuân theo giao thức này.
4. Booking trả chỗ phát sự kiện nội bộ. Listener AFTER_COMMIT gọi dispatcher với
   transaction REQUIRES_NEW. Skip/expire phát cùng sự kiện để cấp người tiếp theo.
   Job chạy đối soát các type còn WAITING, phục hồi lỗi/mất sự kiện giữa hai transaction.
5. Chỉ exception chuyên biệt của accept quá hạn được cấu hình không rollback.
   Các AppException khác, đặc biệt lỗi reserve Booking, vẫn rollback mặc định.
   Ownership được kiểm trước thay đổi. Khi caller ngoài đã có transaction riêng,
   caller vẫn có thể yêu cầu rollback transaction ngoài; kiểm chứng HTTP/service
   boundary bình thường nơi transaction accept là transaction ngoài cùng.
6. TTL offer tự động mặc định 900 giây, có cấu hình tùy chọn; không gửi email hoặc
   notification ra hệ thống ngoài trong Phase 8.

## Trade-off và giới hạn

Khóa TicketType khiến các thao tác waitlist của cùng loại vé chờ nhau, đổi lại không
cần mutex nhiều instance hay thêm schema. Không giữ chỗ cho offer nên mức bảo đảm
cho khách là cơ hội đặt vé, không phải vé đã được dành riêng. Chọn entry đủ số lượng
có thể khiến yêu cầu lớn chờ lâu; giữ policy hiện tại và mô tả rõ.

Sự kiện trong bộ nhớ không bền vững; đối soát định kỳ là đường phục hồi. Chưa hứa
delivery notification; outbox/Kafka chỉ xét ở Phase 9 khi có yêu cầu tương ứng.
Nhiều instance có thể cùng đối soát nhưng phải lấy cùng khóa trước cấp. Chưa đo tải.
Listener đồng bộ với REQUIRES_NEW cần thêm connection trong khi connection giao dịch
ngoài còn chờ cleanup; cần đo và cấu hình pool theo tải trước production.

## Kiểm chứng thực chạy

26 test Phase 8 trên PostgreSQL 17 thử nghiệm riêng, cộng 14 test concurrency trước
và 83 test unit/H2: **123 tests pass, không bỏ qua**. Bộ RED ban đầu chạy 21 test,
tái hiện 17 failures nghiệp vụ, không lỗi setup. [Biên bản Phase 8](../project/phase-8-verification.md).

## Nguồn cơ chế

- [Spring: transaction-bound events](https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html).
- [TransactionalEventListener: tài nguyên sau commit](https://docs.spring.io/spring-framework/docs/6.2.x/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html).
- [Jakarta Transactions: dontRollbackOn](https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/transactional).
- [ADR-005: khóa Booking và thứ tự tài nguyên](ADR-005-booking-and-checkin-concurrency.md).
