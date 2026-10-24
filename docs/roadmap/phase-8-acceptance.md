# Phase 8: phạm vi và tiêu chí hoàn thành

Ngày 19/10/2026. Áp dụng `spec-driven-development`, `test-driven-development` và
triển khai từng phần. Source hiện tại và [ADR-005](../decisions/ADR-005-booking-and-checkin-concurrency.md)
là điểm bắt đầu; giữ thay đổi chưa commit của người dùng.

## Mục tiêu

Hoàn chỉnh luồng sold out → join → inventory trở lại → offer có hạn → accept →
Booking/Payment hiện có. Không thêm Kafka/email, cổng thanh toán hoặc thay counter.

## Quy tắc được giữ và làm rõ

- FIFO trong tập entry đủ số lượng, hòa thời điểm thì ID tăng dần. Không hứa strict FIFO.
- Offer chưa reserve: tổng offer CREATED được cấp dựa trên khả dụng trừ lượng offer
  đang mở. Mua thường vẫn có thể lấy chỗ; accept chỉ thành công khi Booking reserve được.
- TTL tự động mặc định 900 giây. Client xem offer qua API hiện có; notification thuộc Phase 9.
- Chỉ cấp offer cho Event PUBLISHED; kiểm ownership trước mọi thay đổi từ customer.
- Skip/expire kết thúc entry hiện tại; muốn chờ lại thì join mới theo rule sold-out.
- Accept lặp trả cùng convertedBookingId; skip lặp trả cùng SKIPPED; terminal khác bị từ chối.
- Accept hết hạn phải lưu EXPIRED cho cả entry/offer dù API trả INVALID_REQUEST.
- Lỗi tạo Booking phải rollback toàn bộ accept, không đổi entry/offer hoặc giữ thêm chỗ.

## Thiết kế và giới hạn

Khóa TicketType chung cho join/cấp offer/chuyển trạng thái waitlist; khóa Offer sau đó.
Không lấy khóa Offer rồi mới chờ TicketType. Booking cancel/expiry phát sự kiện nội bộ
trong transaction; listener AFTER_COMMIT mở transaction mới để cấp offer. Skip/expire
cũng kích hoạt xem xét hàng chờ sau commit. Job hiện có chạy đối soát định kỳ để phục
hồi sự kiện bỏ lỡ hoặc lỗi listener. Không dùng event trong bộ nhớ làm bảo đảm delivery duy nhất.

Không thêm dependency, schema hoặc migration trong phạm vi này. Các đường service được
tuần tự hóa; thao tác SQL/repository trực tiếp ngoài service không được coi là đã bảo vệ.

## Tiêu chí kiểm chứng

1. Cancel và booking expiry tạo offer tự động sau commit; rollback không tạo offer.
2. Cấp nhiều entry phù hợp mà không hứa cùng một lượng vé cho nhiều offer đang mở.
3. Hai join đồng thời không tạo hai active entry cùng customer/type.
4. Hai worker không cấp trùng; accept/skip/expiry cạnh tranh không chuyển trạng thái hai lần.
5. Hai accept tạo đúng một Booking; replay trả cùng booking.
6. Accept quá hạn commit EXPIRED; sai owner không làm thay đổi trạng thái.
7. Skip/expiry cho phép người tiếp theo nhận offer; job có thể phục hồi sau lỗi/missed event.
8. Chạy lại toàn bộ 14 test PostgreSQL bảo vệ Booking/Payment/check-in trước đó.

Test ở `backend/src/test/java/.../concurrency/`, fixture PostgreSQL riêng với guard localhost;
JUnit/Mockito/H2 vẫn giữ cho unit/regression. Chạy Java21 từ `backend/`:

```powershell
mvn '-Dtest=WaitlistConcurrencyTest' test -B
mvn test -B
```

Cấp biến `EVENTHUB_CONCURRENCY_JDBC_URL`, `EVENTHUB_CONCURRENCY_USERNAME`,
`EVENTHUB_CONCURRENCY_PASSWORD` cho DB thử có thể xóa. Không trỏ database ứng dụng.
Không commit/push, không sửa frontend hoặc cấu hình credentials.
