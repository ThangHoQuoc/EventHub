# Bài 4. QR mang mã tra cứu

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Có QR payload có đồng nghĩa được phép check-in không?

Sau bài này, bạn có thể:

- Trace ưu tiên ticketCode khi cả hai field có giá trị.
- Tách payload dạng chuỗi khỏi ảnh/chữ ký QR.
- Chỉ quyền organizer owner/ADMIN và state guard.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Hoàn thành Payment; phân biệt booking CONFIRMED với vé cá nhân.

## Tình huống và cách nghĩ

Request có cả ticketCode A và qrPayload chứa B.

QR là cách biểu diễn dữ liệu cho máy đọc. Payload hiện là chuỗi EVENTHUB|TICKET|code; nó không phải ảnh
QR hay chữ ký số. Backend phải tra Ticket và kiểm quyền/trạng thái; dữ liệu người quét đưa lên không tự
trở thành quyền sử dụng.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

QR là cách mã hóa dữ liệu thành hình để máy quét đọc; backend hiện chỉ trả chuỗi payload, không sinh
hình. Payload không có chữ ký riêng hay thời hạn; quyền check-in vẫn từ API role/ownership và trạng thái
Ticket. Khách được đọc vé của mình qua validateOwner, organizer chỉ check-in event mình, ADMIN override.

Nếu cả ticketCode/qrPayload gửi nhưng mâu thuẫn, findTicketForCheckIn ưu tiên code và bỏ payload. DTO
không có annotations kiểm cả hai; service bảo vệ đường Java gọi trực tiếp. Thay thế: signed opaque
credential có thể hạn chế đoán/giả mạo nhưng cần key/rotation/validation và threat model; chưa tự thêm.
Debug not-found bằng loại field được chọn và repository method, dùng vé giả.

Test có check-in QR bởi ADMIN và ownership organizer sai; chưa HTTP validation/payload mismatch/security
exploit.

## Cùng trace source

Mở theo thứ tự: [CheckInTicketRequest](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/dto/request/CheckInTicketRequest.java) → [TicketServiceImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java).

Điểm cần tìm: `checkInTicket; findTicketForCheckIn`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [TicketServiceImpl, dòng 177](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java#L177); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
        return "EVENTHUB|TICKET|" + ticketCode;
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Request có cả ticketCode A và qrPayload chứa B.

1. Service ưu tiên ticketCode khi có text.
2. Tìm vé A; không đối chiếu A và B như hai bằng chứng.
3. ADMIN hoặc organizer sở hữu event mới qua quyền check-in.
4. Ticket phải VALID rồi được đổi USED; CUSTOMER có QR không có quyền check-in staff.

**Dừng lại và dự đoán:** Người biết prefix EVENTHUB|TICKET| có thể tự tạo chuỗi bất kỳ để vào cửa không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Chuỗi phải lookup được Ticket thật và caller phải có quyền, ticket VALID. Nhưng payload không có chữ
ký/expiry riêng; không tuyên bố chống sao chép QR chỉ bằng prefix.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Có QR payload có đồng nghĩa được phép check-in không?
2. Trace hoặc dự đoán: Người biết prefix EVENTHUB|TICKET| có thể tự tạo chuỗi bất kỳ để vào cửa không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. QR là cách biểu diễn dữ liệu cho máy đọc. Payload hiện là chuỗi EVENTHUB|TICKET|code; nó không phải
   ảnh QR hay chữ ký số. Backend phải tra Ticket và kiểm quyền/trạng thái; dữ liệu người quét đưa lên
   không tự trở thành quyền sử dụng.

2. Chuỗi phải lookup được Ticket thật và caller phải có quyền, ticket VALID. Nhưng payload không có chữ
   ký/expiry riêng; không tuyên bố chống sao chép QR chỉ bằng prefix.

3. Lần theo `checkInTicket; findTicketForCheckIn` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Chỉ quyền organizer owner/ADMIN và state guard. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Lập ca code-only, payload-only, cả hai khác nhau, không có cả hai, ticket USED và
organizer khác event; tìm guard cho từng ca.

**Tự làm:** Tự mô tả attacker biết bookingId và đoán mã deterministic. Nêu dữ liệu họ còn cần, guard
hiện có và đề xuất random/signed credential theo threat model; không gọi prefix là chống giả.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

CheckInTicketRequest không có field annotation bắt buộc; xem service validation và thứ tự chọn code.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi nêu code precedence, kiểm quyền và state; không gọi payload là ảnh hoặc token có chữ ký.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

qrPayload hiện là chuỗi tra cứu, chưa là ảnh hay credential có chữ ký riêng. Code được ưu tiên nếu gửi
cả hai. Quyền check-in và trạng thái Ticket là hàng rào thực, possession của QR không tự cấp quyền
staff.

[← Bài trước](03-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](05-tu-kiem-chung.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
