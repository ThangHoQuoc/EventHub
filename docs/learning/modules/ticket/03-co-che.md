# Bài 3. Khả dụng là một phép suy ra

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Có cần lưu thêm availableQuantity vào DB để trả response không?

Sau bài này, bạn có thể:

- Tính available từ hai counter theo mapper thật.
- So null semantics của mapper và Booking.
- Phân biệt giá trị suy ra với một cột persisted.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Hoàn thành Event; hiểu DRAFT và PUBLISHED.

## Tình huống và cách nghĩ

quantity=10, soldQuantity=3.

Giá trị suy ra được tính từ các giá trị nguồn. available=quantity−soldQuantity trong mapper giúp tránh
ba cột phải đồng bộ. Điều này chỉ đúng với ngữ nghĩa counter hiện tại: soldQuantity bao gồm cả booking
đang giữ chỗ.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

availableQuantity là giá trị tính từ quantity-soldQuantity trong TicketTypeMapper, không phải cột
persisted. Không lưu cùng một số có thể suy ra giúp tránh một nguồn dữ liệu phải đồng bộ thêm. Mapper
trả null nếu một trong hai counter null; service booking lại coi soldQuantity null là 0. Hai semantics
null khác nhau cần đọc kỹ khi debug.

Runtime mapping lấy event.id thành eventId, tính available; update mapper IGNORE null giữ field bỏ qua.
Nếu response available âm, mapper không clamp; điều đó có thể là dữ liệu lệch, không phải bằng chứng đã
có oversell runtime. Price BigDecimal tránh sai số biểu diễn nhị phân của double; chưa có
currency/precision/scale quy định, không tự suy ra làm tròn.

Thay thế: query projection tính availability tại DB giảm load entity, hoặc domain method tập trung
formula; hiện formula xuất hiện ở mapper/booking/waitlist nên có rủi ro lệch khi sửa. Không cần
microservice inventory chỉ để tránh lặp vài dòng; trước hết thống nhất test formula/null semantics. Test
mapper riêng cho TicketType chưa có class được xác minh, service tests mock mapper không thay test tính
toán thật.

## Cùng trace source

Mở theo thứ tự: [TicketTypeMapper](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/mapper/TicketTypeMapper.java) → [TicketTypeResponse](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/response/TicketTypeResponse.java).

Điểm cần tìm: `calculateAvailableQuantity`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [TicketTypeMapper, dòng 22](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/mapper/TicketTypeMapper.java#L22); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
    default Integer calculateAvailableQuantity(TicketType ticketType) {
        if (ticketType.getQuantity() == null || ticketType.getSoldQuantity() == null) {
            return null;
        }

        return ticketType.getQuantity() - ticketType.getSoldQuantity();
    }
```

Đọc khai báo này cùng field/kiểu và nơi gọi nó. Annotation hay interface không tự chứng minh toàn bộ
request: DTO cần validation pipeline, mapper cần nhánh service phù hợp, query cần transaction và DB
thật. Chọn ranh giới liên quan đến ví dụ trong bài.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

quantity=10, soldQuantity=3.

1. Mapper trả availableQuantity=7.
2. Booking pending giữ thêm 2, DB counter thành 5, lần đọc mới khả dụng=5.
3. Payment confirm không tăng thêm counter.
4. Nếu soldQuantity=null, mapper trả null, khác booking coi null là 0; dữ liệu cũ cần kiểm chứng.

**Dừng lại và dự đoán:** quantity=10, soldQuantity=null: response mapper có trả 10 không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. calculateAvailableQuantity trả null nếu một trong hai field null. Không áp ngầm cách xử lý null
của service booking vào mapper.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Có cần lưu thêm availableQuantity vào DB để trả response không?
2. Trace hoặc dự đoán: quantity=10, soldQuantity=null: response mapper có trả 10 không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Giá trị suy ra được tính từ các giá trị nguồn. available=quantity−soldQuantity trong mapper giúp
   tránh ba cột phải đồng bộ. Điều này chỉ đúng với ngữ nghĩa counter hiện tại: soldQuantity bao gồm cả
   booking đang giữ chỗ.

2. Không. calculateAvailableQuantity trả null nếu một trong hai field null. Không áp ngầm cách xử lý
   null của service booking vào mapper.

3. Lần theo `calculateAvailableQuantity` trong các file đã dẫn; câu trả lời phải có tên field/điều kiện,
   không chỉ nói “service kiểm tra”.

4. Phân biệt giá trị suy ra với một cột persisted. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Tự viết bảng kỳ vọng cho (10,3), (10,0), (10,null), (null,0). Thiết kế mapper test và
giải thích giá trị null cho client.

**Tự làm:** API trả available âm cho quantity3/sold5. Tự nêu hai giả thuyết dữ liệu/đồng bộ, dữ liệu cần
thu thập và test công thức; không kết luận ngay có oversell production.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Đọc default method trong TicketTypeMapper, không suy ra từ tên availableQuantity.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi bốn kết quả đúng, và phân biệt entity stale sau bulk update với phép tính sai.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

availableQuantity là quantity−soldQuantity, không là cột DB; sold hiện gồm pending. Mapper trả null khi
một counter null và không clamp âm. Đừng áp cách Booking xử lý null vào response mapper.

[← Bài trước](02-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](04-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
