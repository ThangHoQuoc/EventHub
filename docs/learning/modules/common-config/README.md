# Common/config — cơ chế dùng chung

**Đọc từ bài 1 xuống dưới. Mỗi buổi chỉ cần một bài và một bài tập.**

Bài response/lỗi có thể đọc sau Auth; auditing sau Ticket; scheduling sau Booking và Waitlist. [Xem vị trí trong lộ trình](../../learning-path.md).

## Mục tiêu đầu ra

Cuối module, hãy tự giải thích và dự đoán được các kết luận sau:

- ApiResponse<T> giữ kiểu payload, không quyết định HTTP status. MVC advice và security handlers là các boundary khác nhau. Enum lỗi tồn tại không tự tạo catch-all response cho DB hay framework exception.
- BaseEntity chia sẻ mapping, không có bảng cha. Auditing gán timestamp theo JPA lifecycle, không phải lịch sử actor/giá trị cũ. Builder thuần và bulk SQL không tương đương entity persist/update qua listener.
- 900 giây là ngưỡng chọn, nhịp quét quyết định lúc xử lý. Before nghiêm ngặt và fixedRate không hứa SLA. Job không có current customer mặc định và chưa có distributed coordination trong source.

Làm bài tự kiểm chứng để kiểm tra khả năng áp dụng, thay vì chỉ nhận ra kết luận khi đọc.

## Chương và thứ tự học

### Chương 1. Bài toán và đường đi

Biết actor, rule và dữ liệu trước khi đọc cơ chế.

1. [Bài toán, actor và trace](01-bai-toan.md) — 20–25 phút

### Chương 2. Cơ chế và dữ liệu

Đi từng bài; sau mỗi ví dụ, tự dự đoán rồi mới mở lời giải.

2. [Lỗi đi ra bằng đường nào?](02-co-che.md) — 20–30 phút
3. [Object đổi lúc nào, DB đổi lúc nào?](03-co-che.md) — 20–30 phút
4. [Đồng hồ và tác vụ nền](04-co-che.md) — 20–30 phút

### Chương 3. Tự kiểm chứng

Khoanh lỗi, thiết kế test và tự đề xuất một thay đổi nhỏ.

5. [Debug, test và bài thiết kế độc lập](05-tu-kiem-chung.md) — 25–30 phút

## Mở source và tra cứu khi cần

Bắt đầu bằng controller/service trong [bảng source bài 1](01-bai-toan.md). Chỉ mở DTO, entity, query và test khi bài đang học gọi tới chúng. Các hình được đặt cạnh phần giải thích tương ứng; [chỉ mục hình](../../assets/README.md) phục vụ tra cứu.

[Domain](../../../domain/domain-overview.md) · [API](../../../api/endpoint-catalog.md) · [Data/JPA](../../../data/database-design.md) · [Security](../../../security/security-model.md).

## Tự ôn và học tiếp

Cuối buổi đóng tài liệu, trả lời câu hỏi trung tâm và ghi một lỗi hiểu của mình. Đầu buổi sau ôn 3 phút; cuối module làm bài 5 rồi chọn phần cần quay lại theo [review-system](../../review-system.md).

[← Ôn bài cơ chế cuối](04-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](../../review-system.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi tài liệu tham khảo.
