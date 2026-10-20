# Tích hợp API EventHub với frontend

## Phạm vi và nhánh

Nhánh làm việc: `feat/connect-remaining-backend-apis`.

Đã fetch remote trước khi triển khai và đối chiếu các nhánh:

| Nhánh remote | Phần đã có, được kế thừa |
| --- | --- |
| `feat/fe-be-booking-flow` | Client booking, MyBookings và MyTickets ban đầu |
| `feat/fe-be-organizer-checkin` | Client organizer/check-in, tạo sự kiện, tạo vé, publish/cancel ban đầu |
| `feat/fe-be-smart-waitlist` | Client Waitlist, đăng ký hàng chờ và MyWaitlist ban đầu |
| `feat/real-event-photography-assets` | Thành phần poster/ảnh sự kiện |

Các commit tích hợp mới chỉ chứa frontend. Những thay đổi backend và docs đã có trước nhiệm vụ vẫn được giữ ngoài các commit này. Kiểm thử local dùng **backend trong working tree**, bao gồm thay đổi Phase 8 chưa commit; không suy ra backend tương ứng đã được push hoặc triển khai.

## Các luồng đã nối

| Giao diện | API sử dụng | Quyền/điểm cần biết |
| --- | --- | --- |
| Đăng ký, đăng nhập, hồ sơ | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/users/me` | Đăng ký tạo CUSTOMER; hồ sơ hiện chỉ đọc |
| Trang chủ, khám phá | `GET /api/v1/events/public` | Công khai, có phân trang/sắp xếp; lọc trên trang dữ liệu đang tải |
| Chi tiết sự kiện | `GET /api/v1/events/public/{id}`, `GET /api/v1/events/{id}/ticket-types` | Danh sách loại vé hiện yêu cầu đăng nhập; không tự thay bằng vé mẫu |
| Checkout | `POST /api/v1/bookings` | CUSTOMER; URL giữ eventId, ticketTypeId và quantity; backend quyết định giá/tồn kho cuối cùng |
| Đơn hàng, thanh toán, kết quả | `GET /api/v1/bookings`, `GET /api/v1/bookings/{id}`, `PATCH /api/v1/bookings/{id}/cancel` | CUSTOMER; dùng đúng PENDING_PAYMENT/CONFIRMED/CANCELLED/EXPIRED; kết quả chỉ thành công khi server trả CONFIRMED |
| Xác nhận thủ công | `POST /api/v1/payments/confirm` | ADMIN tại `/admin/payments`; nhập mã đơn, provider và mã giao dịch đã đối chiếu; không nhập số tiền |
| Vé của tôi, chi tiết vé | `GET /api/v1/tickets`, `GET /api/v1/tickets/{id}` | CUSTOMER; QR mã hóa qrPayload thật bằng qrcode.react, không tạo QR trang trí |
| Check-in | `POST /api/v1/tickets/check-in` | ADMIN/ORGANIZER; nhập ticketCode hoặc qrPayload; giữ nguyên chữ hoa/thường; lịch sử trên UI chỉ thuộc phiên hiện tại |
| Tham gia hàng chờ | `POST /api/v1/ticket-types/{id}/waitlist` | CUSTOMER; có thể chọn từng loại vé đã hết để đăng ký đúng hàng chờ |
| Hàng chờ, lời mời | `GET /api/v1/me/waitlist`, `GET /api/v1/me/waitlist-offers` | CUSTOMER; phân trang độc lập; không tự tạo giá/vị trí trong hàng chờ |
| Chấp nhận/bỏ qua | `POST /api/v1/waitlist-offers/{id}/accept`, `POST /api/v1/waitlist-offers/{id}/skip` | Chấp nhận dùng bookingId do server trả; nhận diện CONVERTED_TO_BOOKING; chặn thao tác với lời mời quá hạn |
| Quản lý sự kiện | `GET /api/v1/events`, `GET /api/v1/events/{id}`, `POST /api/v1/events`, `PATCH /api/v1/events/{id}`, `POST /api/v1/events/{id}/publish`, `POST /api/v1/events/{id}/cancel` | ADMIN/ORGANIZER; dữ liệu và kết quả cập nhật lấy từ server |
| Quản lý loại vé | `GET/POST /api/v1/events/{id}/ticket-types`, `PATCH/DELETE /api/v1/events/ticket-types/{id}` | Thêm/sửa/xóa chỉ trong DRAFT; soldQuantity được ghi rõ là số lượng đã giữ/đã bán |

Các trang nghiệp vụ dùng trạng thái tải/lỗi/rỗng và nút thử lại; không thay lỗi API bằng dữ liệu mẫu hoặc thành công giả. Route guard hỗ trợ trải nghiệm và điều hướng; quyền sở hữu/phân quyền cuối cùng vẫn do backend kiểm tra.

## Giới hạn còn lại của backend

- **Danh sách bản nháp của organizer:** API search hiện chỉ trả PUBLISHED, chưa có bộ lọc organizer/status. Dashboard lọc chủ sở hữu trong từng trang công khai và nói rõ phạm vi. Có thể mở bản nháp bằng ID; các ID vừa tạo được lưu tối đa 20 đường dẫn theo tài khoản trên trình duyệt. Đây không phải danh sách bản nháp đầy đủ từ server.
- **Thanh toán:** chỉ xác nhận thủ công bởi ADMIN. Không có gateway VNPay/MoMo, thẻ, webhook, hoàn tiền, hoặc API danh sách đơn chờ cho ADMIN. UI không thu tiền và không mô phỏng kết quả thành công.
- **Waitlist:** lời mời chưa giữ tồn kho; backend kiểm tra khi chấp nhận. Chưa có API rời hàng chờ, vị trí chính xác hoặc thông báo email; UI không cung cấp các thao tác/số liệu giả này.
- **Hồ sơ:** chưa có API sửa thông tin/đổi mật khẩu. Google login và khôi phục mật khẩu chưa khả dụng; đăng ký không cho tự cấp quyền ORGANIZER.
- **Check-in:** hỗ trợ nhập mã/payload từ thiết bị đọc; quét camera trực tiếp chưa triển khai.
- **EventMatch/thống kê:** chưa có API gợi ý hoặc doanh thu. Trang EventMatch thông báo đang phát triển. Hình ở khu vực đăng nhập/đăng ký được ghi rõ là minh họa thiết kế.
- Tồn kho có thể thay đổi giữa lúc mở trang và tạo đơn. Khi mất kết nối sau POST booking, kiểm tra Đơn hàng trước khi tạo lại; frontend không thể bảo đảm idempotency của một API chưa hỗ trợ khóa yêu cầu.

## Chạy và kiểm tra

Từ `frontend/`:

```powershell
npm ci
npm test
npm run build
npm run dev
```

Vite mặc định ở cổng 5173 và proxy `/api` sang backend local cổng 8080. Bản build dùng đường dẫn API cùng origin; môi trường triển khai cần reverse proxy phù hợp. Backend cần được cấu hình riêng theo hướng dẫn dự án; không sao chép secret vào frontend.

### Đã xác minh ngày 20/10/2026

- 18 kiểm thử Node test runner: trạng thái booking/thanh toán, lựa chọn checkout hợp lệ, hợp đồng gửi booking/payment, lỗi hủy đơn, bộ lọc ngày/thành phố/danh mục, lỗi tải loại vé, dữ liệu giá/tồn kho chưa biết, payload update PUBLISHED, trạng thái Waitlist, QR theo payload và chọn loại vé hết chỗ.
- Build TypeScript/Vite thành công. `typecheck` dùng `tsc -b` để kiểm tra đúng các project references.
- Chạy chính API client frontend với Spring Boot/Java 21 và H2 file riêng trong TEMP: đăng nhập/profile; đọc/tạo/sửa/publish/cancel sự kiện; CRUD loại vé; tạo/đọc/list/hủy booking; join/list/offers/accept/skip Waitlist; chấp nhận lặp lại; ADMIN xác nhận thanh toán lặp lại; phát hành/đọc vé; check-in QR; từ chối check-in lặp, đọc booking của người khác và CUSTOMER xác nhận thanh toán.
- Trình duyệt local: tạo/sửa sự kiện và loại vé; đăng nhập/đăng xuất và quay lại sự kiện; chi tiết công khai; chọn vé/checkout/booking; kết quả chờ rồi chuyển CONFIRMED sau server xác nhận; danh sách/chi tiết vé và QR; tham gia/đọc Waitlist; CUSTOMER bị chặn khỏi organizer; check-in bằng mã thật qua UI và hiển thị lỗi khi check-in lặp lại.
- Hộp thoại native confirm làm công cụ trình duyệt bị kẹt khi thử publish; thao tác này và các nhánh xác nhận còn lại đã được kiểm tra qua API client thật. Không gọi đó là một bộ E2E UI tự động đầy đủ.
- Docker local không sẵn sàng, nên lần này chưa xác minh frontend với PostgreSQL. H2 smoke không chứng minh lock/race condition trên PostgreSQL và không thay thế các kiểm thử đồng thời backend.

Dữ liệu/tài khoản trong smoke test là giả, chỉ thuộc cơ sở dữ liệu kiểm thử riêng. Không dùng tài khoản hoặc database thật để lặp lại các thao tác ghi trong smoke test.
