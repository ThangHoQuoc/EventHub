# Bài 2. Từ số lượng thành vé cá nhân

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao mua ba vé cần ba identity thay vì một counter?

Sau bài này, bạn có thể:

- Tính số Ticket từ quantity từng BookingItem.
- Trace sequence xuyên các item và mã deterministic.
- Chỉ giới hạn return-existing chưa kiểm completeness.

**Cần biết trước:** [Bài toán module](01-bai-toan.md). Hoàn thành Payment; phân biệt booking CONFIRMED với vé cá nhân.

## Tình huống và cách nghĩ

Booking B confirmed có T1×2 và T2×1.

Counter cho biết bao nhiêu chỗ được dùng. Vé cá nhân trả lời chỗ nào đã được dùng tại cổng. Identity ổn
định cho phép tra cứu và chuyển VALID→USED cho một vé cụ thể. BookingItem quantity là số lượng; Ticket
là bản ghi từng quyền vào cửa.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

BookingItem.quantity là số người mua, Ticket là đối tượng riêng có state. Nếu chỉ giảm một counter ở
booking khi check-in, khó biết vé nào đã dùng và ownership từng vé. EventHub tạo identity mỗi đơn vị để
lưu USED/checkedInAt. Sequence toàn booking tránh hai item cùng sinh mã số 1.

TicketCode UNIQUE khai báo ở entity bảo vệ trùng mã nếu schema đúng. findByBookingId giúp replay tuần tự
không tạo lại. Nhưng “list khác rỗng thì trả tất cả” không kiểm đủ số vé: một bộ vé dở dang cũng được
coi như đã phát. Với transaction issuance nguyên vẹn, lỗi DB rollback giúp giảm khả năng partial; dữ
liệu legacy/can thiệp hoặc concurrency vẫn phải xem riêng.

Thay thế: vé UUID ngẫu nhiên khó đoán hơn; unique booking-item/index sequence có thể hỗ trợ đối soát số
lượng; mỗi cách thêm schema/logic. Mã deterministic hiện dễ debug và replay nhưng dễ dự đoán nếu biết
booking ID. Đây là rủi ro threat model, chưa tái hiện khai thác. Debug sequence và item quantities trước
saveAll. Tests có one-ticket-per-quantity và return-existing, chưa partial set.

## Cùng trace source

Mở theo thứ tự: [TicketServiceImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java) → [Ticket](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/entity/Ticket.java).

Điểm cần tìm: `issueTicketsForBooking`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [TicketServiceImpl, dòng 173](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java#L173); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
        return "EVH-" + bookingId + "-" + sequence;
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Booking B confirmed có T1×2 và T2×1.

1. issueTicketsForBooking kiểm booking/customer/items hợp lệ.
2. Loop tạo 3 Ticket, sequence tăng xuyên các item.
3. Mã tương ứng EVH-B-1, EVH-B-2, EVH-B-3 với ID booking minh họa B.
4. Mỗi Ticket VALID, gắn booking/type/customer. Nếu đã có bất kỳ Ticket cho B, service trả list cũ, chưa
   kiểm đủ số lượng.

**Dừng lại và dự đoán:** B cần 3 vé nhưng DB chỉ có 1 vé cũ: gọi issue hiện tại có tự bù 2 vé không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. Nhánh “đã có ticket” trả existing list. Đây là giới hạn completeness, không nên gọi là cơ chế sửa
thiếu vé.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao mua ba vé cần ba identity thay vì một counter?
2. Trace hoặc dự đoán: B cần 3 vé nhưng DB chỉ có 1 vé cũ: gọi issue hiện tại có tự bù 2 vé không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Counter cho biết bao nhiêu chỗ được dùng. Vé cá nhân trả lời chỗ nào đã được dùng tại cổng. Identity
   ổn định cho phép tra cứu và chuyển VALID→USED cho một vé cụ thể. BookingItem quantity là số lượng;
   Ticket là bản ghi từng quyền vào cửa.

2. Không. Nhánh “đã có ticket” trả existing list. Đây là giới hạn completeness, không nên gọi là cơ chế
   sửa thiếu vé.

3. Lần theo `issueTicketsForBooking` trong các file đã dẫn; câu trả lời phải có tên field/điều kiện,
   không chỉ nói “service kiểm tra”.

4. Chỉ giới hạn return-existing chưa kiểm completeness. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Tính số vé và sequence cho hai item quantity 1 và 3; thiết kế test partial existing để
ghi behavior hiện tại và behavior mong muốn riêng.

**Tự làm:** DB có Ticket sequence1 nhưng booking cần4. Tự thiết kế đối soát số vé/identity mà không phát
trùng, nêu constraint và case dữ liệu partial; không giả định current service tự bù.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Tìm điều kiện existingTickets.isEmpty và vị trí tăng sequence.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi dự kiến 4 vé mới cho case sạch, nhưng không kỳ vọng tự bù cho case partial.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

TicketType là sản phẩm, BookingItem là số lượng, Ticket là identity có state. Issuance tạo từng vé với
sequence toàn booking; existing list khác rỗng được trả lại mà chưa kiểm đủ số lượng.

[← Bài trước](01-bai-toan.md) · [Mục lục module](README.md) · [Học tiếp →](03-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
