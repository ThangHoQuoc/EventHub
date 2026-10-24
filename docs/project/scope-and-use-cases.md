# Phạm vi và use case

| Actor | Use case đã có | Điều kiện chính |
|---|---|---|
| Khách chưa đăng nhập | Đăng ký, đăng nhập, danh sách/chi tiết public event | Chỉ event PUBLISHED ở public API |
| CUSTOMER | Tìm event, đặt/hủy booking pending, xem booking/vé của mình | Token hợp lệ, tài khoản ACTIVE, ownership |
| CUSTOMER | Vào waitlist, xem và accept/skip offer của mình | Loại vé hết khả dụng khi join; offer CREATED còn hạn khi accept |
| ORGANIZER | Tạo/sửa/publish/cancel event, cấu hình TicketType | Role và quyền sở hữu; cấu hình loại vé chỉ khi DRAFT |
| ORGANIZER | Check-in ticket | Sở hữu event của ticket; trạng thái VALID |
| ADMIN | Thao tác quản lý được controller cho phép, confirm payment | Không tự suy rộng thành CRUD admin mọi tài nguyên |
| Scheduler | Hoàn tất event quá hạn, hết hạn booking/offer | Quét mỗi 60 giây; đây không phải actor HTTP |

## Tình huống điển hình

Ví dụ minh họa: người tổ chức tạo một workshop, thêm loại vé rồi publish. Khách chọn hai vé, backend ghi snapshot giá và giữ tồn kho. ADMIN xác nhận giao dịch; backend chuyển booking sang CONFIRMED và tạo hai Ticket. Khi quét cửa, ticket VALID chuyển USED. Mỗi bước có API riêng, không phải một transaction kéo dài từ lúc khách mở trình duyệt đến lúc vào cửa.

## Chưa có bằng chứng implementation

Refund, chọn ghế, nhiều ngày/suất diễn, mã giảm giá, checkout/provider webhook, email notification, EventMatch/LLM, Redis/Kafka, refresh/rotation/logout nghiệp vụ, duyệt sự kiện bởi admin, phân phối offer tự động khi tồn kho trở lại. Các enum không chứng minh endpoint chuyển trạng thái tương ứng đã tồn tại.

Nguồn: [module index](../architecture/module-index.md), [catalog API](../api/endpoint-catalog.md). Frontend được nhận diện nhưng không được kiểm thử trong phạm vi này.
