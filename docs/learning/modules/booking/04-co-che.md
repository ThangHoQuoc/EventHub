# Bài 4. Một operation, một lần giải phóng

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Transaction bảo vệ nhóm dữ liệu nào, và chưa bảo vệ điều gì?

Sau bài này, bạn có thể:

- Khoanh transaction reserve và booking/items.
- Giải thích owning FK/cascade, flush và commit.
- Vẽ double release dù TicketType đã bị khóa.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Hoàn thành Ticket; tính được quantity − soldQuantity và đọc List/Map Java.

## Tình huống và cách nghĩ

Booking có T1×2 và T2×1.

Hãy tưởng tượng một hộp chứa reserve, Booking và BookingItem: hoặc cả hộp thành công, hoặc bỏ thay đổi
DB của hộp. Spring dùng proxy quanh public service call để mở/hoàn tất transaction. Gọi private helper
vẫn ở transaction đang có; annotation không tạo phép màu khi tự gọi method bên trong cùng object.

![Ranh giới transaction: flush chưa phải commit](../../assets/rendered/booking-rollback.svg)

Hai cột là hai operation khác thời điểm, không cùng một transaction. Đọc đến hàng lỗi rồi lần ngược để
xác định nhóm bị rollback. Reservation từ create đã commit trước confirm nên vẫn giữ khi confirm lỗi.

## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

Transaction create gom reserve và insert booking/items; exception unchecked rollback cả nhóm DB.
Booking.items cascade ALL, item.booking sở hữu FK; gán cả hai giữ object graph nhất quán. save không
đồng nghĩa mỗi setter đã ghi/commit ngay: JPA flush có thể xảy ra trước query hoặc commit. Private
reserveInventory tham gia transaction public, không phải transaction riêng.

Release khóa Booking trước state check; expiry khóa toàn bộ pending batch theo ID. Sau đó gộp lượng trả và khóa TicketType theo ID tăng dần. Khi một caller đã chuyển khỏi pending và commit, caller tranh chấp không trả lại cùng phần giữ chỗ nữa.

**ĐÃ KIỂM CHỨNG trên PostgreSQL thử riêng:** các lịch cancel/cancel, expiry/expiry, cancel/expiry và confirm đối đầu cancel/expiry; xem [biên bản](../../../project/concurrency-verification.md). Đây không phải kiểm thử production hoặc bằng chứng mọi lịch đều đã được bao phủ.

Thay thế: khóa Booking trước state check hoặc conditional status transition; phải thống nhất thứ tự khóa
với các luồng khác để giảm deadlock. Transaction tách reserve/save riêng sẽ cần bù nếu bước sau lỗi,
phức tạp hơn hiện tại. Test cancel/expire đang verify counter qua mock, chưa kiểm commit/rollback/cạnh
tranh.

## Cùng trace source

Mở theo thứ tự: [BookingServiceImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java) → [Booking](../../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/entity/Booking.java) → [BookingItem](../../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/entity/BookingItem.java) → [BookingRepository](../../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/repository/BookingRepository.java).

Điểm cần tìm: `cancelBooking; expirePendingBookings; releaseInventory`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [BookingServiceImpl, dòng 223](../../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java#L223); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
            int updatedRows = ticketTypeRepository.reserveAvailableQuantity(ticketTypeId, requestedQuantity);

            if (updatedRows != 1) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Booking có T1×2 và T2×1.

1. createBooking qua proxy bắt đầu transaction; gán item.booking và booking.items.
2. Reserve T1 thành công; T2 thiếu chỗ gây AppException.
3. RuntimeException thoát ra, transaction rollback cả T1.
4. Cancel/expire hiện khóa Booking trước. Nếu bỏ khóa Booking và chỉ khóa TicketType như trước sửa, hai caller có thể cùng đọc pending rồi trả chỗ hai lần.

**Dừng lại và dự đoán:** Nếu bỏ khóa Booking: sold=5 gồm booking B×2 và booking khác×3. Hai caller cùng release B rồi clamp
>=0: counter có thể thành bao nhiêu?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Có thể thành 1 theo lịch cả hai cùng đọc pending rồi trừ 2 tuần tự: 5→3→1. Clamp không cứu 2 chỗ của
booking khác. Đây là cơ chế lỗi trước sửa; suite PostgreSQL đã tái hiện double release. Code hiện tại khóa Booking để chặn lịch đó.

</details>

## Nối với bài đã học

Nhớ owning side ở TicketType.event. Ở BookingItem, phía nào ghi booking_id? Cascade ALL không tự gán reference hai chiều. [Ôn bài gốc](../ticket/04-co-che.md).

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Transaction bảo vệ nhóm dữ liệu nào, và chưa bảo vệ điều gì?
2. Trace hoặc dự đoán: sold=5 gồm booking B×2 và booking khác×3. Hai caller cùng release B rồi clamp
   >=0: counter có thể thành bao nhiêu?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Hãy tưởng tượng một hộp chứa reserve, Booking và BookingItem: hoặc cả hộp thành công, hoặc bỏ thay
   đổi DB của hộp. Spring dùng proxy quanh public service call để mở/hoàn tất transaction. Gọi private
   helper vẫn ở transaction đang có; annotation không tạo phép màu khi tự gọi method bên trong cùng
   object.

2. Có thể thành 1 theo lịch cả hai cùng đọc pending rồi trừ 2 tuần tự: 5→3→1. Clamp không cứu 2 chỗ của
   booking khác. Đây là cơ chế lỗi trước sửa; suite PostgreSQL đã tái hiện double release. Code hiện tại khóa Booking để chặn lịch đó.

3. Lần theo `cancelBooking; expirePendingBookings; releaseInventory` trong các file đã dẫn; câu trả lời
   phải có tên field/điều kiện, không chỉ nói “service kiểm tra”.

4. Vẽ double release dù TicketType đã bị khóa. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Thiết kế integration test rollback nhiều item và cancel-vs-expire. Viết invariant “một
chuyển trạng thái khỏi pending chỉ release một lần”.

**Tự làm:** Thiết kế một chốt chuyển PENDING_PAYMENT sang terminal để confirm/cancel/expire chỉ một bên
thắng. Tự chọn khóa hoặc conditional transition và nêu lock order, phản hồi caller thua, invariant.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Khóa Booking trước state check hoặc conditional status transition là các đề xuất để so sánh, chưa sửa
production.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi phân biệt atomicity nhiều bảng với isolation/concurrency, assert state và counter sau commit từ
context mới.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

Transaction gom nhiều ghi DB để rollback cả operation; nó không mặc định ngăn hai caller cùng đọc
pending. Khóa TicketType chưa bảo vệ transition Booking, và clamp counter không chứng minh release đúng
một lần.

[← Bài trước](03-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](05-tu-kiem-chung.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
