# Bài 4. Xác nhận tiền là ranh giới tin cậy

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao amount lấy từ booking mà không lấy từ request?

Sau bài này, bạn có thể:

- Chỉ nguồn amount là Booking snapshot.
- Phân biệt xác nhận ADMIN và xác minh tiền ngân hàng.
- Nêu dữ liệu tin cậy cần có nếu thêm provider sau này.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Hoàn thành Booking; hiểu snapshot, giữ chỗ và rollback.

## Tình huống và cách nghĩ

Booking B lưu total=200.000; giá TicketType sau đó là 150.000.

Một con số client gửi không chứng minh tiền đã đến. EventHub hiện có API ADMIN xác nhận nội bộ, không
tích hợp ngân hàng. Payment amount lấy snapshot Booking để khớp thỏa thuận; Payment SUCCESS là trạng
thái nghiệp vụ lưu sau guard, không tự là bằng chứng đối soát bên ngoài.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

PaymentStatus có PENDING/FAILED/CANCELLED nhưng service hiện chỉ tạo SUCCESS. Enum là tập biểu diễn,
không chứng minh workflow provider. amount lấy booking snapshot; chưa đối chiếu amount do provider ký,
chưa currency/refund. Điều này phù hợp nền tảng demo thủ công, chưa đủ checkout thật.

Phương án mở rộng đúng phải bắt đầu từ đối soát trạng thái và nguồn xác nhận đáng tin, không chỉ đổi tên
provider thành một ngân hàng. Tests mock không chứng minh dòng tiền. Debug chênh amount bằng BookingItem
snapshot/totalAmount/Payment.amount, không lấy TicketType.price mới.

## Cùng trace source

Mở theo thứ tự: [ConfirmPaymentRequest](../../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/dto/request/ConfirmPaymentRequest.java) → [PaymentController](../../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/controller/PaymentController.java) → [PaymentServiceImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/service/Impl/PaymentServiceImpl.java).

Điểm cần tìm: `validateRequest; confirmPayment; toResponse`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [PaymentServiceImpl, dòng 56](../../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/service/Impl/PaymentServiceImpl.java#L56); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
        Payment payment = Payment.builder().booking(booking).amount(booking.getTotalAmount()).status(PaymentStatus.SUCCESS).provider(request.getProvider()).providerTransactionId(request.getProviderTransactionId()).paidAt(Instant.now()).build();
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Booking B lưu total=200.000; giá TicketType sau đó là 150.000.

1. Confirm request mang bookingId/provider/ref, không có amount.
2. Service lấy booking.totalAmount=200.000 làm Payment amount.
3. Booking CONFIRMED và phát vé; soldQuantity không tăng nữa.
4. Không suy ra hệ thống đã verify webhook, currency hoặc refund.

**Dừng lại và dự đoán:** Customer biết provider/ref của mình có tự gọi confirm để nhận vé không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Theo controller hiện tại, endpoint confirm yêu cầu ADMIN. Biết một chuỗi ref không cấp role hay chứng
minh giao dịch ngân hàng.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao amount lấy từ booking mà không lấy từ request?
2. Trace hoặc dự đoán: Customer biết provider/ref của mình có tự gọi confirm để nhận vé không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Một con số client gửi không chứng minh tiền đã đến. EventHub hiện có API ADMIN xác nhận nội bộ, không
   tích hợp ngân hàng. Payment amount lấy snapshot Booking để khớp thỏa thuận; Payment SUCCESS là trạng
   thái nghiệp vụ lưu sau guard, không tự là bằng chứng đối soát bên ngoài.

2. Theo controller hiện tại, endpoint confirm yêu cầu ADMIN. Biết một chuỗi ref không cấp role hay chứng
   minh giao dịch ngân hàng.

3. Lần theo `validateRequest; confirmPayment; toResponse` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Nêu dữ liệu tin cậy cần có nếu thêm provider sau này. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Thiết kế checklist cho một webhook giả định: chữ ký, replay, amount/currency, mapping
booking, idempotency; đánh dấu tất cả phần mới là ĐỀ XUẤT.

**Tự làm:** Một callback giả nói “paid” nhưng amount khác booking total. Tự thiết kế contract từ
chối/đối soát, chữ ký và replay; tách rõ API confirm nội bộ hiện tại với webhook chưa có.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Tách dữ liệu lấy từ nguồn tin cậy và trường khách có thể sửa; so với ConfirmPaymentRequest hiện có.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi không mô tả webhook/refund là đã có và không đọc lại giá TicketType để tính Payment.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

Payment amount lấy Booking.totalAmount, không giá TicketType mới hay input client. SUCCESS trong demo
xác nhận ADMIN không chứng minh đối soát ngân hàng; currency, signature webhook và refund chưa được
triển khai.

[← Bài trước](03-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](05-tu-kiem-chung.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
