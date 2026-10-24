# Học backend Java qua EventHub

Bạn không cần đọc hết repository trước khi bắt đầu. Mỗi buổi học một bài, tự dự đoán một tình huống và làm một bài tập nhỏ rồi dừng.

**Bắt đầu ngay: [Bài mở đầu — theo một lần mua vé](start-here.md).** Bài tập đầu tiên nằm ngay trong bài đó; chưa cần chạy ứng dụng.

[Mở preview và chỉnh cỡ chữ trong IntelliJ](reading-in-intellij.md).

## Ba trang giúp bạn giữ hướng

1. [Cách học một bài trong 25 phút](how-to-study.md): đọc, đóng tài liệu, tự giải thích và luyện một biến thể.
2. [Thứ tự học](learning-path.md): biết module nào học trước, nhánh nào có thể tra riêng.
3. [Hệ thống ôn](review-system.md): nhớ lại những chỗ khó mà không đọc lại toàn bộ.

## Giáo trình có gì?

Chín module, mỗi module có ba chương: bài toán và trace → cơ chế và dữ liệu → tự kiểm chứng. Có 44 bài trong các module và một bài mở đầu. Thời lượng 15–30 phút là ước lượng cho đọc và bài tập nhỏ; bài integration test hoặc thiết kế độc lập có thể cần buổi riêng.

[Auth](modules/auth/README.md) → [User](modules/user/README.md) → [Event](modules/event/README.md) → [Ticket](modules/ticket/README.md) → [Booking](modules/booking/README.md) → [Payment](modules/payment/README.md) → [Ticketing](modules/ticketing/README.md) → [Waitlist](modules/waitlist/README.md) → [Common/config](modules/common-config/README.md).

**Từ module tiếp theo trở đi:** luôn mở README của module, đi từng bài theo số. Cuối mỗi bài có “Học tiếp”; cuối module có bài debug/test. Không phải tự chọn thứ tự giữa các file source.

## Quy ước đọc bằng chứng

- **ĐÃ XÁC MINH:** có nhánh, query hoặc mapping trong source working tree khi biên tập.
- **SUY LUẬN:** lịch xử lý/giới hạn có thể xảy ra, cần test để kết luận runtime.
- **KHOẢNG THIẾU:** chưa thấy flow/caller/test tương ứng.
- **ĐỀ XUẤT:** hướng mở rộng, chưa triển khai trong code.

Ví dụ dùng tên, ID, giờ và số tiền giả; đoạn code trích nguyên văn có link source. JPA annotation là mapping dự kiến, không xác nhận schema production. Giáo trình không thay đổi application code.

[Mục lục tất cả module](modules/README.md) · [Hình và source chỉnh sửa](assets/README.md) · [Báo cáo biên tập và kiểm chứng](quality-report.md).
