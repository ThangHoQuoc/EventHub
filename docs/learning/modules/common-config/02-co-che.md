# Bài 2. Lỗi đi ra bằng đường nào?

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao cùng request sai nhưng có thể dùng hai handler khác nhau?

Sau bài này, bạn có thể:

- Giải thích T của response wrapper và HTTP status riêng.
- Nối validation/AppException/security với handler thật.
- Chỉ lỗi chưa có contract envelope chuẩn hóa.

**Cần biết trước:** [Bài toán module](01-bai-toan.md). Bài response/lỗi có thể đọc sau Auth; auditing sau Ticket; scheduling sau Booking và Waitlist.

## Tình huống và cách nghĩ

Hai request giả: không token gọi URL bảo vệ; có token hợp lệ nhưng body quantity=0.

Wrapper generic giữ cùng hình response với payload khác kiểu; nó không quyết định HTTP status. Exception
boundary là nơi chuyển lỗi giữa tầng: service nêu ErrorCode, MVC advice dịch thành response. Security
xảy ra ở filter có entry point/denied handler riêng trước controller.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

ApiResponse<T> là container kiểu tổng quát; ApiResponse<BookingResponse> giữ compile-time type của
result mà không tạo một wrapper riêng cho từng endpoint. PageResponse<T> đóng gói content và metadata.
Nó giải quyết lặp response shape, không tự chọn HTTP status; createEvent vẫn cần
@ResponseStatus(CREATED), delete type vẫn 200 theo controller.

AppException là RuntimeException kèm ErrorCode. Service nói lỗi nghiệp vụ bằng enum;
GlobalExceptionHandler dịch ra HTTP. Bỏ phân lớp này dễ dẫn tới controller lặp catch và service biết quá
nhiều transport. Nhưng enum chung có thể lớn và generic INVALID_REQUEST làm lỗi khó phân biệt; tách mã
chi tiết chỉ khi client/debug cần.

Runtime exception bubbling đi qua proxy transaction trước khi advice tạo response, nên xử lý HTTP không
“cứu” transaction đã rollback. Security exception nằm trong filter path cần entry point/denied handler.
Thay thế: Problem Details là hợp đồng khác có lợi tiêu chuẩn hóa nhưng cần migration client; chưa dùng.
Debug lỗi shape bằng loại exception và tầng phát sinh, không sửa wrapper để che mọi lỗi.

Test đề xuất MockMvc validation/AppException/malformed JSON/DB collision; chưa có suite đó.

## Cùng trace source

Mở theo thứ tự: [ApiResponse](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/response/ApiResponse.java) → [AppException](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/AppException.java) → [GlobalExceptionHandler](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/GlobalExceptionHandler.java) → [AuthenticationEntryPoint](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/JwtAuthenticationEntryPoint.java) → [AccessDeniedHandler](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/JwtAccessDeniedHandler.java).

Điểm cần tìm: `@ExceptionHandler; commence; handle`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [AppException, dòng 6](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/AppException.java#L6); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Hai request giả: không token gọi URL bảo vệ; có token hợp lệ nhưng body quantity=0.

1. Request đầu bị security từ chối, đi entry point 401.
2. Request sau qua security, MVC @Valid phát hiện field lỗi.
3. Advice trả HTTP400, code1007 và map field.
4. Service có thể chưa được gọi ở cả hai; không phải mọi lỗi do AppException.

**Dừng lại và dự đoán:** ApiResponse code=1000 có chứng minh HTTP200 không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. HTTP status và application code là hai lớp. createEvent có HTTP201; auth/test còn trả String thay
envelope.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao cùng request sai nhưng có thể dùng hai handler khác nhau?
2. Trace hoặc dự đoán: ApiResponse code=1000 có chứng minh HTTP200 không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Wrapper generic giữ cùng hình response với payload khác kiểu; nó không quyết định HTTP status.
   Exception boundary là nơi chuyển lỗi giữa tầng: service nêu ErrorCode, MVC advice dịch thành
   response. Security xảy ra ở filter có entry point/denied handler riêng trước controller.

2. Không. HTTP status và application code là hai lớp. createEvent có HTTP201; auth/test còn trả String
   thay envelope.

3. Lần theo `@ExceptionHandler; commence; handle` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Chỉ lỗi chưa có contract envelope chuẩn hóa. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Lập ma trận validation/AppException/401/403/malformed JSON/DB collision, nối với
handler thật; đánh dấu các dòng chưa chuẩn hóa.

**Tự làm:** Một client mong mọi HTTP400 có map field validation. Tự thiết kế cách phân biệt domain
error, malformed JSON và validation, rồi chọn một error mapping cần test contract.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Tìm @ExceptionHandler và security handlers riêng; enum INTERNAL_SERVER_ERROR tồn tại không có nghĩa
catch-all đã dùng nó.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi chỉ đúng tầng phát sinh và không hứa mọi exception cùng response shape.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

ApiResponse<T> giữ kiểu payload, không quyết định HTTP status. MVC advice và security handlers là các
boundary khác nhau. Enum lỗi tồn tại không tự tạo catch-all response cho DB hay framework exception.

[← Bài trước](01-bai-toan.md) · [Mục lục module](README.md) · [Học tiếp →](03-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
