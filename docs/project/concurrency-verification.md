# Kiểm chứng chống xử lý trùng booking, payment và check-in

Ngày 19/10/2026, kiểm tra working tree có thay đổi chưa commit của người dùng.
Không reset/checkout/commit/push. Không thay cấu hình ứng dụng, POM hoặc schema.

## Kết quả thực chạy

| Bước | Kết quả |
|---|---|
| RED: suite race trên implementation trước sửa | 9 tests chạy, 9 failures, 0 errors, 0 skipped; tái hiện lỗi nghiệp vụ |
| GREEN sau khóa Booking/Ticket | 9 tests chạy thành công |
| Suite mở rộng và regression toàn backend | **97 tests, 0 failures, 0 errors, 0 skipped; BUILD SUCCESS** |
| Môi trường | Java 21.0.10, Maven 3.9.16; 83 test unit/H2 và 14 integration test PostgreSQL 17 |

Maven chạy offline với cache chỉ định rõ bằng `-Dmaven.repo.local`, không thêm dependency.
PostgreSQL được tạo trong container riêng từ image `postgres:17-alpine` có sẵn,
database `eventhub_concurrency_test`, publish trên localhost với port ngẫu nhiên.
Không dùng PostgreSQL của ứng dụng hoặc tài khoản thật. Container thử được dọn sau kiểm tra.

## Điều đã sửa

- [BookingRepository](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/repository/BookingRepository.java):
  finder khóa hàng để cancel/confirm; query expiry có khóa và sắp Booking ID.
- [BookingServiceImpl](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java):
  cancel khóa trước state check; expiry khóa batch trước khi gộp và trả TicketType theo ID.
- [PaymentServiceImpl](../../backend/src/main/java/com/eventhub/eventhub_backend/payment/service/Impl/PaymentServiceImpl.java):
  khóa Booking trước lookup reference, rồi giữ cùng transaction tới hết phát vé.
- [TicketRepository](../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/repository/TicketRepository.java):
  cả finder code và payload đều khóa ghi trước VALID→USED.
- Hai unit test Booking/Payment hiện có cập nhật mock finder tương ứng; giữ assertion nghiệp vụ.

## 14 test PostgreSQL

Source: [BookingConcurrencyTest](../../backend/src/test/java/com/eventhub/eventhub_backend/concurrency/BookingConcurrencyTest.java).

1. Cancel/cancel: một success, một INVALID_REQUEST; trả đúng một phần giữ chỗ.
2. Expiry/expiry: số lượng xử lý lần lượt 1 và 0.
3. Cancel thắng expiry: expiry xử lý 0.
4. Expiry thắng cancel: cancel bị từ chối.
5. Hai booking chung loại vé cancel đồng thời: trả đúng cả hai phần giữ chỗ.
6. Expiry batch hai booking chung loại vé: gộp và trả đủ lượng.
7. Phát vé lỗi: rollback Booking CONFIRMED và Payment SUCCESS, giữ reservation trước đó.
8. Confirm cùng reference: hai caller nhận cùng payment, DB chỉ có một payment và đủ một bộ vé.
9. Confirm khác reference trên một booking: chỉ một caller thành công.
10. Confirm thắng cancel: cancel bị từ chối, giữ reservation cho booking đã thanh toán.
11. Cancel thắng confirm: không có payment hoặc vé mới.
12. Confirm thắng expiry: expiry không trả chỗ của booking đã xác nhận.
13. Expiry thắng confirm: không có payment hoặc vé mới.
14. Code và QR payload cùng check-in một vé: một success, một INVALID_REQUEST, Ticket USED.

Harness dùng hai transaction/connection độc lập: caller đầu chạy service, flush và giữ commit;
caller sau chạy trong transaction khác. Test chỉ nhả commit khi `pg_stat_activity` xác nhận
caller sau đang chờ khóa. Poll có timeout; không dựa vào một khoảng sleep để đoán lịch chạy.
Fixture có thêm phần giữ chỗ khác để `Math.max(0, ...)` không che lỗi double release.
Scheduler được mock để không can thiệp fixture; service/repository và transaction đều thật.

## Chạy lại

Chỉ cung cấp database PostgreSQL thử nghiệm riêng, có thể xóa toàn bộ. Suite dùng
`create-drop` và kiểm tra URL phải là localhost, tên DB bắt đầu `eventhub_concurrency`.
Không đổi tên database thật để vượt qua guard này.

```powershell
# Điền port và credentials của PostgreSQL thử riêng; không dùng database ứng dụng.
$env:EVENTHUB_CONCURRENCY_JDBC_URL='jdbc:postgresql://127.0.0.1:TEST_PORT/eventhub_concurrency_test'
$env:EVENTHUB_CONCURRENCY_USERNAME='TEST_USER'
$env:EVENTHUB_CONCURRENCY_PASSWORD='TEST_PASSWORD'
# JAVA_HOME phải trỏ JDK21. JWT_SECRET chỉ dùng giá trị giả đủ độ dài cho test context.
mvn test -B
# Chỉ suite PostgreSQL:
mvn '-Dtest=BookingConcurrencyTest' test -B
```

Chạy lệnh từ `backend/`. Khi không có biến URL, 14 test PostgreSQL được bỏ qua có chủ đích;
83 test thông thường vẫn chạy. Vì vậy báo cáo kiểm concurrency phải ghi cả số test skipped.

## Giới hạn còn lại

- Đã kiểm concurrency service/DB, chưa kiểm HTTP end-to-end, tải hoặc nhiều process ứng dụng.
- Chưa thử schema/dữ liệu production; test dựng schema sạch từ entity.
- Unique payment reference giữa hai booking khác nhau vẫn do DB phân xử; chưa chuẩn hóa
  response collision hoặc đối soát partial issuance.
- Chưa sửa double accept/expiry rollback của WaitlistOffer hoặc thêm chính sách late payment.
- Expiry giữ khóa cả batch tới commit; cần đo tải trước khi chọn cách chia batch/worker.

[ADR-005](../decisions/ADR-005-booking-and-checkin-concurrency.md) ghi thứ tự khóa và trade-off.
