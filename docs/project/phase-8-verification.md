# Phase 8 — Smart Waitlist: kết quả và cách kiểm chứng

Ngày 19/10/2026. Hoàn thành phạm vi [tiêu chí Phase 8](../roadmap/phase-8-acceptance.md)
trong working tree; chưa commit/push. Giữ các thay đổi có sẵn của người dùng.

## Hành vi hiện tại

1. Khách join khi loại vé hết khả dụng; khóa TicketType trước kiểm active entry trùng.
2. Booking cancel/expiry trả chỗ trong transaction, phát TicketAvailabilityChangedEvent.
3. Chỉ sau commit, listener gọi dispatcher mở REQUIRES_NEW. Rollback không cấp offer.
4. Dispatcher khóa TicketType, yêu cầu Event PUBLISHED, tính budget = available trừ tổng
   quantity của offer CREATED; chọn WAITING cũ nhất đủ quantity, hòa thời điểm theo ID.
5. Tạo một hoặc nhiều offer tới khi hết budget/entry phù hợp. Entry chuyển OFFERED;
   offer CREATED, expiresAt mặc định sau 900 giây.
6. Khách xem API offer hiện có rồi accept/skip. Các transition khóa Type rồi Offer.
   Hai accept trả cùng convertedBookingId và chỉ tạo một Booking.
7. Skip/expiry giải phóng budget offer, phát sự kiện sau commit để mời người tiếp theo.
8. Job mỗi 60 giây hết hạn offer và đối soát type còn WAITING, phục hồi khi bỏ lỡ sự kiện.

**Offer không giữ chỗ.** Tổng lượng offer được giới hạn khi cấp nhưng khách mua thường
vẫn có thể lấy chỗ sau đó. Accept phải reserve bằng BookingService; hết chỗ làm accept
rollback, giữ offer CREATED để retry nếu còn hạn. Chỉ exception accept quá hạn được
cấu hình không rollback để lưu EXPIRED cho cả entry/offer rồi trả INVALID_REQUEST.
Nếu caller bọc một transaction ngoài và tự rollback, quy tắc transaction ngoài vẫn áp dụng.

TTL có thể cấu hình tùy chọn bằng `eventhub.waitlist.offer-ttl-seconds` (mặc định 900,
phải > 0). Không đổi application.properties, endpoint, DTO, bảng hoặc counter.
Không thêm dependency, email hoặc Kafka; notification thuộc Phase 9.

## Kết quả thực chạy

| Kiểm tra | Kết quả |
|---|---|
| RED trước sửa | 21 test, 17 failures nghiệp vụ, 0 errors, 4 pass |
| Slice Waitlist + unit ảnh hưởng | 56 test pass, gồm 24 test PostgreSQL Phase 8 lúc đó |
| Full regression trước thêm biên | 121 test pass |
| Full regression cuối | **123 tests, 0 failures, 0 errors, 0 skipped; BUILD SUCCESS** |
| Phân loại | 83 unit/H2, 14 PostgreSQL Booking/Payment/check-in, 26 PostgreSQL Waitlist |
| Môi trường | Java 21.0.10, Maven 3.9.16, PostgreSQL 17-alpine trong container thử riêng |

Lượt chạy đầu vướng overload assertEquals trong test, đã sửa type assertion trước
khi ghi nhận RED nghiệp vụ. Không coi lỗi compile là bằng chứng tái hiện race.
Maven dùng cache offline có sẵn, không thêm dependency. DB có tên
`eventhub_concurrency_test`, localhost port ngẫu nhiên; không dùng DB ứng dụng.
Container thử và volume của nó được dọn sau kiểm tra.

## 26 test Waitlist

Source: [WaitlistConcurrencyTest](../../backend/src/test/java/com/eventhub/eventhub_backend/concurrency/WaitlistConcurrencyTest.java).

- Hai join cùng customer/type: đúng một active entry.
- Hai worker cấp offer: không tạo trùng hoặc vượt budget; active offer trừ ngân sách
  nhưng không tăng soldQuantity; tạo offer thủ công cũng phải qua ngân sách.
- FIFO eligible, bỏ qua entry quá lớn; hòa createdAt được quyết định theo ID; không
  cấp cho Event chưa PUBLISHED.
- Hai accept cùng offer: cùng Booking; accept/skip và accept/expiry theo cả hai chiều
  không ghi đè terminal state.
- Accept hết hạn commit EXPIRED dù trả lỗi; sai owner không đổi entry/offer; reserve
  hết chỗ rollback accept. Deadline bằng cutoff được expire đúng một lần.
- Cancel/expiry Booking tự cấp offer sau commit; trước commit hoặc rollback không cấp.
- Skip/expiry/expired accept tự mời người tiếp; trả hai chỗ cấp đủ hai offer khác nhau,
  không reserve thêm và retry không cấp dư.
- Ghế cuối: accept thắng mua thường hoặc mua thường thắng accept đều không oversell.
- Job đối soát phục hồi tồn kho trống sau sự kiện bị bỏ lỡ; chạy lại không cấp trùng.

Các test concurrency dùng hai connection/transaction thật và quan sát lock waiter qua
pg_stat_activity trước khi nhả commit. Scheduler được mock trong flow test để không
thể pass nhờ job nền; test phục hồi gọi job với service/repository thật. Fixture được
xóa theo ID tự tạo, worker có timeout và shutdown trong finally.

## File chính

- [WaitlistOfferServiceImpl](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/service/Impl/WaitlistOfferServiceImpl.java):
  khóa, ngân sách, dispatcher, expiry và exception rule.
- [WaitlistServiceImpl](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/service/Impl/WaitlistServiceImpl.java):
  khóa trước join; hai repository waitlist có metadata/lock/budget/queue queries.
- [BookingServiceImpl](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java):
  phát sự kiện sau thao tác trả chỗ trong transaction.
- [TicketAvailabilityChangedEvent](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/event/TicketAvailabilityChangedEvent.java),
  [WaitlistInventoryListener](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/event/WaitlistInventoryListener.java),
  [WaitlistOfferExpiredException](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/exception/WaitlistOfferExpiredException.java): file mới.
- [WaitlistScheduler](../../backend/src/main/java/com/eventhub/eventhub_backend/config/WaitlistScheduler.java):
  thêm đối soát phục hồi, ghi log và thử lại từng loại vé khi dispatcher lỗi.
- Unit test Booking/Waitlist cập nhật mock finder/publisher và fixture có tồn kho trả lại.
- [ADR-006](../decisions/ADR-006-waitlist-runtime-and-offer-transitions.md), business rules,
  transaction/flow docs và module Waitlist được cập nhật. Thêm hình runtime, đồng bộ
  SVG/Mermaid cùng 26 trích đoạn source và số dòng.

## Chạy lại

Chuẩn bị PostgreSQL thử riêng có thể xóa, dùng localhost và tên database bắt đầu
`eventhub_concurrency`. Suite dùng create-drop và guard URL; không trỏ DB ứng dụng.
Đặt biến URL/user/password giống [hướng dẫn concurrency](concurrency-verification.md),
chạy từ `backend/` bằng JDK21:

```powershell
mvn '-Dtest=WaitlistConcurrencyTest' test -B
mvn test -B
```

Nếu không có EVENTHUB_CONCURRENCY_JDBC_URL, 40 test PostgreSQL được bỏ qua có chủ đích;
không coi kết quả chỉ 83 test là đã kiểm lại concurrency.

## Giới hạn

Chưa kiểm HTTP end-to-end, schema/dữ liệu production, tải, pool starvation hoặc nhiều
process ứng dụng. Khóa có tác dụng tại DB nhưng chưa có load benchmark. Không thêm
unique active constraint/migration cho SQL ghi trực tiếp ngoài các service đã bảo vệ.
Policy FIFO eligible có thể khiến yêu cầu lớn chờ lâu. Sự kiện trong bộ nhớ không bền
vững; job phục hồi đã có, notification/outbox/Kafka chưa thuộc phạm vi Phase 8.
