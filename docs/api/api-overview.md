# Hợp đồng API

API nghiệp vụ dùng prefix `/api/v1`. Có 31 mapping controller trong backend đã khảo sát. Không thấy dependency springdoc/Swagger/OpenAPI trong POM, nên catalog này được đối chiếu trực tiếp với controller, DTO, service và security config; không thêm dependency/spec mới.

Đọc [endpoint catalog](endpoint-catalog.md) để chọn API, [DTO contracts](dto-contracts.md) để biết trường và validation, [quy ước/lỗi](conventions-and-error-handling.md) để hiểu status/paging. API public sự kiện khác API tìm kiếm `/events`: search vẫn cần đăng nhập theo SecurityConfig.

## Ví dụ giả định, không chứa token thật

Body đặt hai vé của một loại (thay identifier bằng ID thật trong môi trường thử):

```json
{"items":[{"ticketTypeId":"<ID loại vé thử>","quantity":2}]}
```

Server tự tính giá, client không gửi totalAmount. Gửi cùng body lần hai **tạo booking khác**, chưa có idempotency key cho create booking. Nếu client timeout sau khi gửi, không retry mù mà cần cơ chế đối soát được thiết kế thêm.

Confirm payment yêu cầu ADMIN và body bookingId/provider/providerTransactionId. Provider là dữ liệu mô tả, không chứng minh backend đã xác thực ngân hàng. Reference lặp cho cùng booking SUCCESS trả bản ghi cũ tuần tự; concurrency xem [data integrity](../data/transaction-and-data-integrity.md).
