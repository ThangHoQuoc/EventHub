# Bài 2. Dữ liệu hợp lệ chưa chắc được phép

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao quantity dương vẫn có thể bị từ chối?

Sau bài này, bạn có thể:

- Phân biệt DTO constraint với invariant quantity≥sold.
- Trace role/owner/DRAFT trước thao tác ghi.
- Chọn ca qua @Positive nhưng bị service chặn.

**Cần biết trước:** [Bài toán module](01-bai-toan.md). Hoàn thành Event; hiểu DRAFT và PUBLISHED.

## Tình huống và cách nghĩ

TicketType giả quantity=10, soldQuantity=4.

Validation đầu vào kiểm tra từng giá trị. Invariant là điều kiện cần giữ trên dữ liệu liên quan: không
thể hạ capacity thấp hơn counter đã dùng. Role, owner và Event state quyết định ai được đổi cấu hình.
Các hàng rào này giải quyết câu hỏi khác nhau.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

@NotNull/@Positive trên create price/quantity chặn thiếu/≤0 ở HTTP. Update có @Positive và @Size cho tên
nullable; service còn chặn name có toàn whitespace. Những annotation này không được gắn vào entity
TicketType, nên ghi từ repository hoặc method Java trực tiếp không tự được cùng lớp bảo vệ. Project cần
cả đầu vào đúng dạng và quy tắc quantity≥soldQuantity để tránh giảm capacity dưới chỗ đang chiếm.

Cơ chế MVC: @Valid chạy trước controller body; field errors được GlobalExceptionHandler đổi thành map
400. Business check chạy trong service sau load dữ liệu. DB entity hiện không khai báo CHECK/UNIQUE cho
tên/số lượng, khác với User email UNIQUE. Hai create đồng thời có thể cùng vượt exists-like check trong
list; đây là rủi ro chưa kiểm PostgreSQL.

Thay thế: unique DB theo event và tên chuẩn hóa giúp chặn cạnh tranh, nhưng phải thống nhất case/trim và
migration dữ liệu trùng; không tự thêm trong docs. Debug 400 bằng field map trước, rồi breakpoint
service duplicate/quantity. Tests unit có duplicate và quantity dưới sold, chưa chứng minh DB
constraint.

## Cùng trace source

Mở theo thứ tự: [TicketTypeServiceImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/service/Impl/TicketTypeServiceImpl.java) → [UpdateTicketTypeRequest](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/request/UpdateTicketTypeRequest.java).

Điểm cần tìm: `updateTicketType; deleteTicketType`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [UpdateTicketTypeRequest, dòng 26](../../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/request/UpdateTicketTypeRequest.java#L26); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
    @Positive
    Integer quantity;
```

Đọc khai báo này cùng field/kiểu và nơi gọi nó. Annotation hay interface không tự chứng minh toàn bộ
request: DTO cần validation pipeline, mapper cần nhánh service phù hợp, query cần transaction và DB
thật. Chọn ranh giới liên quan đến ví dụ trong bài.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

TicketType giả quantity=10, soldQuantity=4.

1. Update quantity=3 là số dương nên có thể qua @Positive.
2. Service so với soldQuantity: 3<4 nên từ chối.
3. quantity=6 chỉ được xét tiếp nếu Event DRAFT và caller có quyền.
4. TicketType có soldQuantity>0 cũng không được xóa theo rule hiện tại.

**Dừng lại và dự đoán:** ADMIN update TicketType của Event PUBLISHED: role cao có bỏ qua rule DRAFT không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. Quyền thao tác và điều kiện trạng thái là hai guard độc lập; source yêu cầu DRAFT cho cấu hình loại vé.

</details>

## Nối với bài đã học

Nhớ ba hàng rào đăng ký. Ở đây rule qty≥sold dùng dữ liệu nhiều field; hãy nêu một input qua @Positive nhưng vẫn sai nghiệp vụ. [Ôn bài gốc](../auth/04-co-che.md).

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao quantity dương vẫn có thể bị từ chối?
2. Trace hoặc dự đoán: ADMIN update TicketType của Event PUBLISHED: role cao có bỏ qua rule DRAFT không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Validation đầu vào kiểm tra từng giá trị. Invariant là điều kiện cần giữ trên dữ liệu liên quan:
   không thể hạ capacity thấp hơn counter đã dùng. Role, owner và Event state quyết định ai được đổi cấu
   hình. Các hàng rào này giải quyết câu hỏi khác nhau.

2. Không. Quyền thao tác và điều kiện trạng thái là hai guard độc lập; source yêu cầu DRAFT cho cấu hình
   loại vé.

3. Lần theo `updateTicketType; deleteTicketType` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Chọn ca qua @Positive nhưng bị service chặn. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Lập test table qty/sold/state/owner cho update và delete; chọn hai ca qua DTO nhưng
thất bại service.

**Tự làm:** Hai organizer request tạo tên “VIP” và “vip” trong cùng Event gần nhau. Tự vẽ lịch
read-list→check→save; đề xuất constraint và policy trim/case trước khi chọn schema.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Đọc UpdateTicketTypeRequest cùng validate trong service; null không tương đương 0.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi có assertion không save/delete sau guard và không biến DTO annotation thành DB constraint.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

Input dương có thể vẫn sai nghiệp vụ. Cấu hình TicketType cần DRAFT và quyền; không hạ quantity dưới
sold hay xóa khi đã dùng. DTO validation không tự bảo vệ mọi đường repository/SQL.

[← Bài trước](01-bai-toan.md) · [Mục lục module](README.md) · [Học tiếp →](03-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
