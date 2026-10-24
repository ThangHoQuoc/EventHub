# Event — vòng đời sự kiện

**Đọc từ bài 1 xuống dưới. Mỗi buổi chỉ cần một bài và một bài tập.**

Hoàn thành User; phân biệt role và ownership. [Xem vị trí trong lộ trình](../../learning-path.md).

## Mục tiêu đầu ra

Cuối module, hãy tự giải thích và dự đoán được các kết luận sau:

- Enum giới hạn tên state; service mới giới hạn transition. Publish cần DRAFT, dữ liệu/thời gian và quyền; terminal không update. Cancel không tự hoàn tiền, complete là đường job riêng.
- Null-ignore giữ field cũ, không cho thao tác xóa bằng null. DRAFT dùng mapper sau guard thời gian; PUBLISHED set tay một số field, từ chối time/thumbnail và bỏ qua category.
- Search luôn lọc PUBLISHED, keyword OR trong một nhóm rồi AND với các filter. Cận thời gian là nằm trọn khoảng. Data và count là hai query; sort chưa có whitelist và mock page chưa test SQL thật.

Làm bài tự kiểm chứng để kiểm tra khả năng áp dụng, thay vì chỉ nhận ra kết luận khi đọc.

## Chương và thứ tự học

### Chương 1. Bài toán và đường đi

Biết actor, rule và dữ liệu trước khi đọc cơ chế.

1. [Bài toán, actor và trace](01-bai-toan.md) — 20–25 phút

### Chương 2. Cơ chế và dữ liệu

Đi từng bài; sau mỗi ví dụ, tự dự đoán rồi mới mở lời giải.

2. [Trạng thái quyết định thao tác](02-co-che.md) — 20–30 phút
3. [PATCH: giữ cũ hay xóa đi?](03-co-che.md) — 20–30 phút
4. [Tìm kiếm là tổ hợp điều kiện](04-co-che.md) — 20–30 phút

### Chương 3. Tự kiểm chứng

Khoanh lỗi, thiết kế test và tự đề xuất một thay đổi nhỏ.

5. [Debug, test và bài thiết kế độc lập](05-tu-kiem-chung.md) — 25–30 phút

## Mở source và tra cứu khi cần

Bắt đầu bằng controller/service trong [bảng source bài 1](01-bai-toan.md). Chỉ mở DTO, entity, query và test khi bài đang học gọi tới chúng. Các hình được đặt cạnh phần giải thích tương ứng; [chỉ mục hình](../../assets/README.md) phục vụ tra cứu.

[Domain](../../../domain/domain-overview.md) · [API](../../../api/endpoint-catalog.md) · [Data/JPA](../../../data/database-design.md) · [Security](../../../security/security-model.md).

## Tự ôn và học tiếp

Cuối buổi đóng tài liệu, trả lời câu hỏi trung tâm và ghi một lỗi hiểu của mình. Đầu buổi sau ôn 3 phút; cuối module làm bài 5 rồi chọn phần cần quay lại theo [review-system](../../review-system.md).

[← Ôn bài cơ chế cuối](04-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](../ticket/README.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi tài liệu tham khảo.
