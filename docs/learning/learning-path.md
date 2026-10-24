# Thứ tự học: một đường chính, vài chỗ tra cứu

**Hôm nay:** [Bài mở đầu](start-here.md) → [Auth bài 1](modules/auth/01-bai-toan.md). Nếu chỉ có 25 phút, học bài mở đầu rồi dừng. Không phải hoàn thành cả module trong một buổi.

## Đường chính

| Chặng | Đọc theo thứ tự | Cần biết trước | Đi tiếp khi tự làm được |
|---|---|---|---|
| 0 | [Bài mở đầu](start-here.md), [cách học](how-to-study.md) | Java cơ bản, HTTP sơ bộ | Phân biệt loại vé/booking/payment/ticket |
| 1 | [Auth: 5 bài](modules/auth/README.md) | Class, interface, constructor | Trace login và request token; phân biệt role DB |
| 2 | [User: 4 bài](modules/user/README.md) | Auth principal/context | Trace me và giải thích DTO không password |
| 3 | [Event: 5 bài](modules/event/README.md) | User, role/owner | Vẽ lifecycle, dự đoán PATCH/search |
| 4 | [Ticket: 5 bài](modules/ticket/README.md) | Event DRAFT/PUBLISHED | Tính available, chỉ owning side FK |
| 5 | [Booking: 5 bài](modules/booking/README.md) | Ticket, List/Map | Trace reserve/release, giá snapshot, rollback |
| 6 | [Payment: 5 bài](modules/payment/README.md) | Booking transaction | Phân biệt retry/unique/state và trust boundary |
| 7 | [Ticketing: 5 bài](modules/ticketing/README.md) | Payment confirmed | Tính số vé, trace check-in, thiết kế double-scan test |
| 8 | [Waitlist: 5 bài](modules/waitlist/README.md) | Booking, idempotency/state | Explain eligible FIFO, offer không reserve, expiry rollback |
| 9 | [Common/config: 5 bài](modules/common-config/README.md) | Đã thấy request và job thực | Nối lỗi, auditing và clock với nghiệp vụ |

Trong mỗi module: chương 1 bài toán → chương 2 cơ chế → chương 3 bài tổng hợp. README module và thanh điều hướng từng bài là thứ tự chuẩn. Mỗi bài ghi prerequisite riêng; nếu kẹt, quay đúng bài nền thay vì đọc toàn bộ reference.

## Nhánh có thể đọc riêng khi cần

- Gặp `ApiResponse<T>` hoặc lỗi 400/401/403: đọc [Common bài 2](modules/common-config/02-co-che.md) sau Auth, rồi trở lại bài đang học.
- Chưa hiểu entity/timestamp: sau Ticket đọc [Common bài 3](modules/common-config/03-co-che.md).
- Debug quá hạn: sau Booking và Waitlist đọc [Common bài 4](modules/common-config/04-co-che.md).
- Chỉ tra endpoint: [API catalog](../api/endpoint-catalog.md); chỉ tra field/FK: [data](../data/database-design.md). Đây là tài liệu tra cứu, không thêm vào hàng chờ đọc bắt buộc.

## Những lần quay lại có chủ đích

| Khái niệm | Lần đầu | Áp dụng lại với câu hỏi mới |
|---|---|---|
| Identity và quyền | Auth bài 3, User bài 2 | Event/Ticketing: biết người gọi rồi có quyền trên tài nguyên nào? |
| Validation và invariant | Auth bài 4 | Ticket bài 2: dữ liệu dương nhưng vượt rule quan hệ có được lưu? |
| Object và FK | Ticket bài 4 | Booking bài 4: cascade lưu items dựa trên owning side nào? |
| Transaction | Booking bài 4 | Payment bài 3 → Waitlist bài 4: service khác và save rồi throw |
| Đọc rồi ghi | Booking bài 3 | Payment bài 2 → Ticketing bài 3: unique key/status cuối có đủ? |
| Thời gian | Event bài 2 | Waitlist bài 4 → Common bài 4: Before, deadline và nhịp job |

Đầu chặng mới, trả lời một câu nối kiến thức cũ ở bảng trên. Cuối chặng, làm bài tự kiểm chứng; sáng hôm sau dùng [review-system](review-system.md) trong 3–5 phút.

## Khi làm module tiếp theo của dự án

Giữ cùng trình tự: actor/rule → một request thật → dữ liệu/FK/state → cơ chế mới → lỗi/test → tự thiết kế. Module mới cần README có prerequisite, danh sách bài đánh số và một bài bắt đầu rõ ràng. Không học mọi annotation trước khi biết use case cần nó.
