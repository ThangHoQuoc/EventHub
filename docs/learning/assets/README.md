# Hình dùng trong giáo trình

Source chỉnh sửa: [figures.json](sources/figures.json) cho 16 hình cơ chế và [flows.json](sources/flows.json) cho 13 flow/sequence. Bộ dựng SVG dùng Python standard library: [render.py](sources/render.py), bố cục trong [layout.py](sources/layout.py).

```powershell
python docs/learning/assets/sources/render.py
```

Sửa JSON rồi render lại. Không sửa chỉ bản SVG. Bài học nhúng hình và có hướng dẫn đọc ngay sau hình; số liệu/ID trong hình là minh họa. Race timeline ghi khả năng cần integration test, không phải kết quả benchmark hay lỗi production đã tái hiện.

| Hình | Cách biểu diễn |
|---|---|
| [BCrypt: tạo hash và kiểm tra là hai thao tác](rendered/auth-password.svg) | compare |
| [Token hợp lệ chưa phải quyền thao tác tài nguyên](rendered/auth-identity.svg) | lanes |
| [Hai lần đọc “chưa tồn tại” vẫn có thể trùng email](rendered/auth-unique.svg) | lanes |
| [User entity và UserResponse có mục đích khác nhau](rendered/user-boundary.svg) | compare |
| [Vòng đời Event: enum không tự cho phép chuyển trạng thái](rendered/event-state.svg) | state |
| [PATCH theo trạng thái: reject khác ignore](rendered/event-patch.svg) | table |
| [Reference Java và khóa ngoại database](rendered/ticket-relationship.svg) | relationship |
| [Một loại vé: giữ chỗ nằm trong soldQuantity](rendered/booking-inventory.svg) | table |
| [Vé cuối: precheck và điểm ghi quyết định](rendered/booking-race.svg) | lanes |
| [Ranh giới transaction: flush chưa phải commit](rendered/booking-rollback.svg) | transaction |
| [Phạm vi khóa idempotency provider + reference](rendered/payment-key.svg) | table |
| [Hai cổng quét: USED cuối cùng chưa đủ](rendered/ticketing-race.svg) | lanes |
| [Chọn sớm nhất trong tập đủ số lượng](rendered/waitlist-policy.svg) | table |
| [Offer không reserve: accept vẫn phải tranh chỗ](rendered/waitlist-offer.svg) | table |
| [Object EXPIRED khác trạng thái đã commit](rendered/waitlist-rollback.svg) | compare |
| [900 giây + nhịp quét: deadline khác lúc xử lý](rendered/common-time.svg) | timeline |

Hai hình tổng quan mua vé và trace User được giữ từ [diagram hệ thống](../../assets/diagrams/README.md). Tám trace module trong giáo trình được thay bằng 13 góc nhìn dưới đây; tài sản hệ thống cũ vẫn được giữ để các tài liệu khác tiếp tục sử dụng. Màu chỉ hỗ trợ phân biệt; nhãn điều kiện, mũi tên và mô tả sau hình giải thích ý nghĩa.

## Flow và sequence theo implementation

Mỗi flow tập trung vào một nhóm điều kiện; sequence tách riêng tương tác và thứ tự gọi.
SVG được dựng trực tiếp từ JSON để kiểm soát cỡ chữ và chiều rộng; `.mmd` là bản Mermaid
xuất từ cùng nguồn, không phải nguồn dùng để render SVG. Sửa JSON rồi chạy lại bộ dựng
để đồng bộ cả hai. Chưa kiểm tra `.mmd` bằng Mermaid runtime trong IntelliJ.

| Hình | Source Mermaid | Căn cứ source |
|---|---|---|
| [Login: kiểm credentials rồi mới cấp token](rendered/auth-login-sequence.svg) | [auth-login-sequence.mmd](sources/auth-login-sequence.mmd) | [AuthServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/auth/service/Impl/AuthServiceImpl.java) · [JwtServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/auth/security/Impl/JwtServiceImpl.java) |
| [Filter: từ Bearer token đến Authentication](rendered/auth-filter-flow.svg) | [auth-filter-flow.mmd](sources/auth-filter-flow.mmd) | [JwtAuthenticationFilter.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/auth/security/Impl/JwtAuthenticationFilter.java) · [SecurityConfig.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/config/SecurityConfig.java) |
| [Booking: kiểm dữ liệu trước khi reserve](rendered/booking-validation-flow.svg) | [booking-validation-flow.mmd](sources/booking-validation-flow.mmd) | [BookingController.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/controller/BookingController.java) · [BookingServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java) |
| [Booking: reserve và lưu cùng một transaction](rendered/booking-reserve-sequence.svg) | [booking-reserve-sequence.mmd](sources/booking-reserve-sequence.mmd) | [BookingServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java) · [TicketTypeRepository.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/repository/TicketTypeRepository.java) · [Booking.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/entity/Booking.java) |
| [Publish Event: state, dữ liệu rồi quyền](rendered/event-publish-flow.svg) | [event-publish-flow.mmd](sources/event-publish-flow.mmd) | [EventController.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/event/controller/EventController.java) · [EventServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/event/service/Impl/EventServiceImpl.java) |
| [TicketType: cấu hình trước khi mở bán](rendered/ticket-create-flow.svg) | [ticket-create-flow.mmd](sources/ticket-create-flow.mmd) | [TicketTypeController.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/controller/TicketTypeController.java) · [TicketTypeServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/service/Impl/TicketTypeServiceImpl.java) |
| [Payment: chọn replay hay xác nhận mới](rendered/payment-replay-flow.svg) | [payment-replay-flow.mmd](sources/payment-replay-flow.mmd) | [PaymentController.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/controller/PaymentController.java) · [PaymentServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/service/Impl/PaymentServiceImpl.java) · [Payment.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/entity/Payment.java) |
| [Payment: phát vé trước khi transaction hoàn tất](rendered/payment-commit-sequence.svg) | [payment-commit-sequence.mmd](sources/payment-commit-sequence.mmd) | [PaymentServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/payment/service/Impl/PaymentServiceImpl.java) · [TicketServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java) |
| [Phát hành: từ số lượng thành từng vé](rendered/ticketing-issuance-flow.svg) | [ticketing-issuance-flow.mmd](sources/ticketing-issuance-flow.mmd) | [TicketServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java) |
| [Check-in: tìm vé, kiểm quyền rồi đổi trạng thái](rendered/ticketing-checkin-flow.svg) | [ticketing-checkin-flow.mmd](sources/ticketing-checkin-flow.mmd) | [TicketController.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/controller/TicketController.java) · [TicketServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/service/Impl/TicketServiceImpl.java) |
| [Accept offer: replay, deadline và cơ hội đặt](rendered/waitlist-accept-flow.svg) | [waitlist-accept-flow.mmd](sources/waitlist-accept-flow.mmd) | [WaitlistOfferServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/service/Impl/WaitlistOfferServiceImpl.java) · [BookingServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java) |
| [Accept: reuse Booking trong transaction đang có](rendered/waitlist-booking-sequence.svg) | [waitlist-booking-sequence.mmd](sources/waitlist-booking-sequence.mmd) | [WaitlistOfferServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/service/Impl/WaitlistOfferServiceImpl.java) · [BookingServiceImpl.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/booking/service/Impl/BookingServiceImpl.java) |
| [Request: dừng ở tầng nào, handler nào trả lỗi?](rendered/common-request-boundaries.svg) | [common-request-boundaries.mmd](sources/common-request-boundaries.mmd) | [SecurityConfig.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/config/SecurityConfig.java) · [GlobalExceptionHandler.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/GlobalExceptionHandler.java) · [JwtAuthenticationEntryPoint.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/JwtAuthenticationEntryPoint.java) · [JwtAccessDeniedHandler.java](../../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/JwtAccessDeniedHandler.java) |

## Kiểm tra và đọc

```powershell
python docs/learning/assets/sources/verify.py
```

Bộ kiểm tra đối chiếu link/anchor, 45 bài, 26 trích đoạn source, SVG với JSON và các
bản Mermaid được xuất. Không chạy backend/frontend. Hình có title/description cho
trình đọc; font chính 20–22px trên canvas 880px. Xem [hướng dẫn IntelliJ](../reading-in-intellij.md)
và [báo cáo hiển thị](../reading-experience-report.md).

## Bổ sung Phase 8

[Runtime Waitlist](rendered/waitlist-runtime-flow.svg) · [Mermaid](sources/waitlist-runtime-flow.mmd).
Cập nhật hình accept/deadline và nguồn JSON theo [ADR-006](../../decisions/ADR-006-waitlist-runtime-and-offer-transitions.md).
