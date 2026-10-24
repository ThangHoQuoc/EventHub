# Bàn giao bộ tài liệu backend

## Phase 8 cập nhật ngày 19/10/2026

Đã nối release sau commit với dispatcher; khóa Type/Offer, ngân sách offer, expiry commit và job phục hồi. **123 tests pass**, gồm 40 test PostgreSQL (26 Waitlist mới). Xem [biên bản Phase 8](../project/phase-8-verification.md). Chưa commit; Phase 9 notification là bước tiếp theo. Các snapshot phía dưới là lịch sử.


## Cập nhật code ngày 19/10/2026

Đã sửa cạnh tranh cancel/expiry/confirm bằng khóa Booking và check-in bằng khóa Ticket;
97 tests pass, gồm 14 test PostgreSQL thử nghiệm riêng. Xem
[biên bản](../project/concurrency-verification.md) và
[ADR-005](../decisions/ADR-005-booking-and-checkin-concurrency.md).
Chưa commit. Waitlist runtime/offer concurrency, provider thật và HTTP collision contract còn lại.
Snapshot bên dưới là lịch sử ngày 09/10, không dùng các khoảng thiếu đã sửa làm hiện trạng mới.

## Snapshot

Ngày 09/10/2026, HEAD `8f258e2d7c4397200e9273f1ec0f7336e6559b9a`; tài liệu phản ánh working tree gồm thay đổi chưa commit, không chỉ commit đó. Phiên tiếp theo phải chạy git status và đối chiếu source mới.

Trước khi viết docs đã có sửa BookingRepository, BookingService, BookingServiceImpl, PaymentServiceImpl, TicketTypeRepository, WaitlistController và hai test booking/payment. BookingScheduler.java, FRONTEND_UI_SPEC.md và frontend chưa được track tại lúc khảo sát. Không hoàn tác/chỉnh các file đó trong nhiệm vụ docs.

## Kết quả và điểm vào

Đã tạo hai lớp tài liệu: AGENTS/routing/handoff cho AI và tham chiếu/9 learning guides cho người học. [Docs index](../README.md) là điểm điều hướng; [survey](../project/survey.md) ghi phạm vi đọc; [verification](../project/verification.md) ghi kết quả kiểm tra thật. SVG và source ở assets/diagrams, có render.py không cần dependency.

## Điều không được quên

- Working tree đã reserve pending bằng soldQuantity; Payment không tăng lần hai. ADR-002 cũ là lịch sử khác; xem ADR-003.
- Payment chỉ ADMIN confirm thủ công, chưa provider/webhook/refund.
- Waitlist có service cấp offer nhưng chưa thấy caller runtime sau release.
- Transaction/unique reference chưa chứng minh chống mọi race. Ưu tiên Booking transition, double confirm/check-in/accept và rollback accept expired.
- 83 tests đã chạy H2/Mockito trên JDK21; chưa HTTP/PostgreSQL runtime/performance/deployment.
- Máy có Java8 mặc định, đã dùng JAVA_HOME JDK21 chỉ trong tiến trình test; không đổi cấu hình hệ thống.

## Tiếp theo nếu được giao task code

Đọc phase1/2 trong [roadmap](../roadmap/development-phases.md), chọn invariant và viết test PostgreSQL thật trước thay đổi. Bảo toàn working tree của người dùng; không coi tài liệu này là ủy quyền sửa logic. Nhiệm vụ hiện tại chỉ tài liệu và tài sản tài liệu, không có code feature dang dở do phiên này tạo.
