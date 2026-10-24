# Danh mục các trang Frontend EventHub (Page Catalog & Roadmap)

Tài liệu này tổng hợp toàn bộ các trang giao diện (pages) cần có để hoàn thiện nền tảng **EventHub Frontend**, được đối chiếu trực tiếp với nghiệp vụ hệ thống, vai trò người dùng (`CUSTOMER`, `ORGANIZER`, `ADMIN`) và các endpoint backend hiện hữu.

---

## 1. Tổng quan tiến độ

- **Tổng số trang dự kiến**: 25 trang
- **Đã hoàn thành**: 19 trang (9 trang Consumer Flow + 5 trang Customer Portal + 5 trang Organizer Portal)
- **Chưa hoàn thành**: 6 trang (Admin Portal & Trang phụ trợ)

---

## 2. Chi tiết danh mục các trang

### PHẦN 1: Luồng Khám phá & Đặt vé (Consumer Flow)
> Phục vụ người dùng tìm kiếm, xem chi tiết và hoàn tất quy trình mua vé.

| STT | Tên trang | Route | Component | Chức năng chính | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| 1 | **Trang chủ** | `/` | `LandingPage.tsx` | Khám phá sự kiện nổi bật, tìm kiếm nhanh, EventMatch teaser, Smart Waitlist vị trí hàng chờ, bento thành phố, banner vé. | **Đã xong** |
| 2 | **Khám phá sự kiện** | `/explore` | `ExploreEventsPage.tsx` | Tìm kiếm đa tiêu chí, thanh lọc nhanh danh mục, bộ lọc bên (thành phố, giá, thời gian, tình trạng vé), thanh công cụ kết quả. | **Đã xong** |
| 3 | **Chi tiết sự kiện** | `/events/:id` | `EventDetailPage.tsx` | Bố cục bài viết chuyên sâu: Poster, thông tin chi tiết, lịch trình, địa điểm, thẻ đặt vé sticky chọn hạng vé và tính tổng tiền. | **Đã xong** |
| 4 | **EventMatch AI** | `/eventmatch` | `EventMatchPage.tsx` | Tìm sự kiện bằng tiếng Việt tự nhiên, thẻ phân tích intent người dùng (thành phố, ngân sách, gu), danh sách sự kiện phù hợp. | **Đã xong** |
| 5 | **Đăng nhập** | `/login` | `LoginPage.tsx` | Đăng nhập tài khoản bằng email/mật khẩu, đăng nhập nhanh với Google, show/hide mật khẩu, ghi nhớ đăng nhập. | **Đã xong** |
| 6 | **Đăng ký** | `/register` | `RegisterPage.tsx` | Đăng ký tài khoản, chuyển đổi vai trò Khách hàng / Nhà tổ chức, xác thực mật khẩu trùng khớp, điều khoản sử dụng. | **Đã xong** |
| 7 | **Xác nhận giỏ vé** | `/checkout` | `CheckoutPage.tsx` | Stepper 4 bước, thẻ thông tin người nhận vé, danh sách vé đã chọn, tăng giảm số lượng, áp dụng mã ưu đãi (`EVENTHUB50`). | **Đã xong** |
| 8 | **Thanh toán** | `/payment` | `PaymentPage.tsx` | Chọn cổng thanh toán (VNPay QR, MoMo QR, Thẻ ATM 8 ngân hàng, Thẻ quốc tế), bộ đếm QR, tùy chọn xuất hóa đơn GTGT. | **Đã xong** |
| 9 | **Kết quả thanh toán** | `/payment/result` | `PaymentResultPage.tsx` | E-ticket điện tử đầy đủ mã QR check-in; xử lý 3 trạng thái giao dịch (`success`, `failed`, `processing`), tải PDF vé. | **Đã xong** |

---

### PHẦN 2: Tài khoản & Vé của tôi (Customer Portal)
> Phục vụ khách hàng sau khi mua vé hoặc tham gia danh sách chờ. Ánh xạ với API `/tickets`, `/bookings`, `/me/waitlist`.

| STT | Tên trang | Route | Backend API liên quan | Chức năng chính | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| 10 | **Vé của tôi** | `/my-tickets` | `GET /api/v1/tickets` | Danh sách vé điện tử đang sở hữu, lọc theo sắp diễn ra / đã check-in, xem mã QR từng vé, tải vé PDF. | **Đã xong** |
| 11 | **Chi tiết vé điện tử** | `/my-tickets/:ticketId` | `GET /api/v1/tickets/{ticketId}` | Màn hình vé lớn dùng trực tiếp tại cổng soát vé, mã QR to nét, thông tin chỗ ngồi/hạng vé, hướng dẫn check-in. | **Đã xong** |
| 12 | **Lịch sử đơn hàng** | `/my-bookings` | `GET /api/v1/bookings`<br>`PATCH /api/v1/bookings/{id}/cancel` | Quản lý các đơn đặt vé (Đã thanh toán, Đang giữ chỗ, Đã hủy, Hết hạn), nút hủy đơn pending giải phóng tồn kho. | **Đã xong** |
| 13 | **Danh sách chờ & Ưu đãi** | `/my-waitlist` | `GET /api/v1/me/waitlist`<br>`GET /api/v1/me/waitlist-offers`<br>`POST /api/v1/waitlist-offers/{id}/accept`<br>`POST /api/v1/waitlist-offers/{id}/skip` | Danh sách sự kiện đang xếp hàng chờ vé; nhận thông báo và thao tác **Chấp nhận mua (Accept)** hoặc **Bỏ qua (Skip)** khi có suất nhượng vé (Waitlist Offer). | **Đã xong** |
| 14 | **Thông tin tài khoản** | `/profile` | `GET /api/v1/users/me` | Xem và cập nhật thông tin cá nhân (họ tên, số điện thoại, email nhận vé, thành phố), đổi mật khẩu. | **Đã xong** |

---

### PHẦN 3: Cổng Nhà tổ chức (Organizer Portal)
> Dành cho tài khoản Organizer tạo và quản lý sự kiện. Ánh xạ với API `/events`, `/events/{id}/ticket-types`, `/tickets/check-in`.

| STT | Tên trang | Route | Component | Backend API liên quan | Chức năng chính | Trạng thái |
|:---:|:---|:---|:---|:---|:---|:---:|
| 15 | **Tổng quan Nhà tổ chức** | `/organizer/dashboard` | `OrganizerDashboardPage.tsx` | `GET /api/v1/events` (role `ORGANIZER`) | Thống kê số vé đã bán, doanh thu tạm tính, tỷ lệ check-in, danh sách sự kiện quản lý. | **Đã xong** |
| 16 | **Tạo sự kiện mới** | `/organizer/events/new` | `CreateEventPage.tsx` | `POST /api/v1/events` | Wizard nhập thông tin sự kiện: tiêu đề, danh mục, địa điểm, thời gian bắt đầu/kết thúc, tải ảnh poster. | **Đã xong** |
| 17 | **Cấu hình loại vé** | `/organizer/events/:id/tickets` | `EventTicketsConfigPage.tsx` | `POST/PATCH/DELETE /api/v1/events/{id}/ticket-types` | Thiết lập hạng vé (Standard, VIP, Early Bird), số lượng mở bán, giá vé, tiến độ bán vé, modal chỉnh sửa. | **Đã xong** |
| 18 | **Chỉnh sửa / Xuất bản sự kiện** | `/organizer/events/:id/edit` | `EditEventPage.tsx` | `PATCH /api/v1/events/{id}`<br>`POST /api/v1/events/{id}/publish`<br>`POST /api/v1/events/{id}/cancel` | Quản lý vòng đời sự kiện: Chỉnh sửa bản nháp (`DRAFT`), xuất bản chính thức (`PUBLISH`), hoặc hủy sự kiện (`CANCEL`). | **Đã xong** |
| 19 | **Trạm soát vé Check-in** | `/organizer/check-in` | `CheckInStationPage.tsx` | `POST /api/v1/tickets/check-in` | Giao diện cho nhân viên tại cổng sự kiện: Quét camera mã QR laser hoặc nhập mã thủ công, phản hồi tức thì và ghi log check-in. | **Đã xong** |

---

### PHẦN 4: Cổng Quản trị hệ thống (Admin Portal)
> Dành cho quản trị viên EventHub kiểm duyệt nội dung và đối soát giao dịch nền tảng.

| STT | Tên trang | Route dự kiến | Backend API liên quan | Chức năng chính | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| 20 | **Xác nhận thanh toán thủ công** | `/admin/payments` | `POST /api/v1/payments/confirm` | Đối soát và bấm duyệt đơn hàng chuyển khoản ngân hàng đang ở trạng thái pending. | *Chưa làm* |
| 21 | **Kiểm duyệt sự kiện** | `/admin/events` | `GET /api/v1/events` (role `ADMIN`) | Danh sách toàn bộ sự kiện trên nền tảng, quyền gỡ bỏ hoặc hủy sự kiện vi phạm quy định. | *Chưa làm* |

---

### PHẦN 5: Trang phụ trợ & Pháp lý (Static & Utility)
> Hỗ trợ trải nghiệm người dùng, chính sách nền tảng và xử lý ngoại lệ điều hướng.

| STT | Tên trang | Route dự kiến | Chức năng chính | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 22 | **Điều khoản sử dụng** | `/terms` | Quy định đặt vé, chính sách hoàn hủy và trách nhiệm hai bên. | *Chưa làm* |
| 23 | **Chính sách bảo mật** | `/privacy` | Quy định bảo mật thông tin tài khoản và giao dịch thanh toán. | *Chưa làm* |
| 24 | **Trung tâm trợ giúp (FAQ/Help)** | `/help` | Câu hỏi thường gặp: cách nhận vé, thanh toán lỗi, đổi vé, liên hệ ban tổ chức. | *Chưa làm* |
| 25 | **Trang 404 Not Found** | `*` | Màn hình báo lỗi đường dẫn không tồn tại và nút điều hướng quay về trang chủ. | *Chưa làm* |
