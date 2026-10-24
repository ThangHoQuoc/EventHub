# ADR-005: Tuần tự hóa chuyển trạng thái Booking và check-in

## Trạng thái

Đã triển khai và kiểm chứng trong working tree ngày 19/10/2026; chưa commit.

## Bối cảnh

Theo [ADR-003](ADR-003-current-inventory-semantics.md), booking pending đã giữ chỗ.
Khóa TicketType khi trả chỗ chỉ bảo vệ phép trừ; hai caller đã đọc cùng trạng thái
pending vẫn có thể trả hai lần. Confirm tranh chấp cancel/expiry có thể tạo vé cho
chỗ đã trả. Tương tự, hai scanner có thể cùng đọc VALID rồi cùng báo check-in thành công.

## Quyết định

- Cancel và confirm lấy khóa ghi bi quan trên Booking trước khi đọc/kiểm tra trạng
  thái. Confirm tra payment reference sau khi lấy khóa để retry cùng booking nhìn
  thấy payment đã commit và trả lại kết quả cũ.
- Expiry chọn Booking pending cũ bằng truy vấn có khóa, sắp ID tăng dần. Truy vấn
  khóa toàn bộ Booking được chọn trước khi trả tồn kho. Gộp lượng trả của cả batch,
  rồi khóa/cập nhật TicketType theo ID tăng dần như đường cancel/reserve.
- Hai đường check-in bằng ticketCode và qrPayload cùng khóa hàng Ticket trước
  kiểm tra VALID. Giữ quyền ADMIN/organizer sở hữu sự kiện và phản hồi lỗi hiện có.
- Giữ khóa đến commit/rollback bằng transaction service hiện có. Không thêm mutex
  trong bộ nhớ vì nó không bảo vệ được nhiều instance ứng dụng.

Với PostgreSQL ở READ COMMITTED, transaction đến sau chờ khóa rồi đánh giá trạng
thái đã commit. Confirm/cancel/expiry được quyết định theo thao tác giành khóa và
commit thành công trước; không bổ sung chính sách từ chối thanh toán theo tuổi đơn.
Job expiry vẫn dùng cutoff hiện tại và quét theo nhịp cũ.

## Hệ quả và giới hạn

- Không đổi endpoint, DTO, counter semantics hoặc schema; không cần migration mới.
- Khóa có thể gây chờ; expiry batch lớn giữ nhiều khóa đến cuối transaction.
  Chia batch là cải tiến tiếp theo nếu có số liệu tải, không thay âm thầm giao dịch hiện có.
- Thứ tự Booking rồi TicketType, cùng thứ tự ID trong batch, giảm chu kỳ chờ giữa
  các đường đã sửa. Không khẳng định mọi thao tác khác trong hệ thống hết deadlock.
- Unique provider/reference tiếp tục bảo vệ cùng reference dùng cho hai booking
  khác nhau. Request thua có thể nhận lỗi constraint; chưa chuẩn hóa lỗi HTTP đó.
- Chưa sửa double accept WaitlistOffer, rollback accept hết hạn, đối soát vé thiếu,
  provider thật hoặc vòng đời Event cancellation/refund.

## Căn cứ

- [Spring Data JPA locking](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html).
- [PostgreSQL 17: row locks và thứ tự lấy khóa](https://www.postgresql.org/docs/17/explicit-locking.html).
- [Mô hình transaction và dữ liệu](../data/transaction-and-data-integrity.md).

## Kiểm chứng

Test đồng thời phải dùng PostgreSQL thử nghiệm riêng, hai transaction độc lập,
quan sát transaction thứ hai đang đợi khóa trước khi cho transaction đầu commit.
Kiểm cả response/error, trạng thái Booking/Ticket, payment count, ticket count và
soldQuantity. **97 tests pass**, gồm 14 test PostgreSQL; 9 test race đã thất bại trên
implementation trước sửa. Chi tiết ở [biên bản kiểm chứng](../project/concurrency-verification.md).
