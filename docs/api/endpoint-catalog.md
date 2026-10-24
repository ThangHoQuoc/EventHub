# Catalog endpoint đã có

**ĐÃ XÁC MINH từ source, chưa gọi HTTP runtime trong nhiệm vụ docs.** Mọi path dưới đây bắt đầu `/api/v1`. Thành công trả HTTP 200, ngoại trừ POST `/events` là 201. Response là `ApiResponse<T>` với code/message/result, trừ `/auth/test` trả String. DELETE TicketType trả wrapper result trống với 200, không phải 204.

Mọi endpoint có body đều dùng @Valid tại controller. Chi tiết trường/constraint và response có tại [DTO contracts](dto-contracts.md). Với dòng “phân trang”, query gồm page/size/sort; page bắt đầu 0. Mọi endpoint bảo vệ có thể trả 401 khi thiếu/sai token, 403 khi sai role. Cột lỗi bổ sung là lỗi domain tiêu biểu ngoài validation 400; xem [bảng mã lỗi](conventions-and-error-handling.md).

## Auth và user

Nguồn: [AuthController](../../backend/src/main/java/com/eventhub/eventhub_backend/auth/controller/AuthController.java), [UserController](../../backend/src/main/java/com/eventhub/eventhub_backend/user/controller/UserController.java). Học [auth](../learning/modules/auth.md), [user](../learning/modules/user.md). Quy tắc BR01–02 trong [business rules](../domain/business-rules.md).

| HTTP/path | Chức năng, quyền | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| POST /auth/register | Đăng ký, public; role luôn CUSTOMER | RegisterRequest | RegisterResponse | AuthService.register; 409 USER_EXISTED |
| POST /auth/login | Đăng nhập, public; chỉ ACTIVE | LoginRequest | LoginResponse | AuthService.login; 404 USER_NOT_FOUND, 401 INVALID_PASSWORD, 403 UNAUTHORIZED |
| GET /auth/test | Thử xác thực, authenticated | Không | String thuần | Controller.test; không có service |
| GET /users/me | Xem tài khoản hiện tại, authenticated | Không | UserResponse | CurrentUserService.getCurrentUser; 404 USER_NOT_FOUND |
| GET /admin/test | Thử ADMIN | Không | String trong wrapper | AdminTestController.test; không có service |

## Event

Nguồn: [EventController](../../backend/src/main/java/com/eventhub/eventhub_backend/event/controller/EventController.java), EventServiceImpl. Học [event](../learning/modules/event.md); BR03–06.

| HTTP/path | Chức năng, quyền/ownership | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| POST /events | Tạo DRAFT, ADMIN/ORGANIZER, organizer=current user | CreateEventRequest | EventResponse; **201** | createEvent; 400 INVALID_REQUEST, 404 USER_NOT_FOUND |
| GET /events | Tìm event PUBLISHED, authenticated | EventSearchRequest qua query; phân trang | PageResponse<EventResponse> | getEvents; sort sai/bind sai chưa có error mapping riêng |
| GET /events/public | Danh sách PUBLISHED, public | Phân trang, mặc định size=10, sort=createdAt DESC | PageResponse<EventResponse> | getPublishedEvents |
| GET /events/public/{eventId} | Chi tiết PUBLISHED, public | eventId | EventResponse | getPublishedEvent; 404 EVENT_NOT_FOUND cả khi DRAFT |
| GET /events/{eventId} | authenticated; CUSTOMER chỉ PUBLISHED; ORGANIZER chỉ của mình; ADMIN tất cả | eventId | EventResponse | getEvent; 404 EVENT_NOT_FOUND, 403 UNAUTHORIZED |
| PATCH /events/{eventId} | ADMIN hoặc chủ ORGANIZER; terminal không sửa | eventId + UpdateEventRequest | EventResponse | updateEvent; 404, 403, 400 EVENT_CANNOT_BE_UPDATED/INVALID_REQUEST |
| POST /events/{eventId}/publish | ADMIN hoặc chủ ORGANIZER; chỉ DRAFT hợp lệ | eventId; không body | EventResponse | publishEvent; 404, 403, 400 INVALID_REQUEST/EVENT_CANNOT_BE_UPDATED |
| POST /events/{eventId}/cancel | ADMIN hoặc chủ ORGANIZER; DRAFT/PUBLISHED | eventId; không body | EventResponse | cancelEvent; 404, 403, 400 EVENT_CANNOT_BE_UPDATED |

UpdateEventRequest không có Bean Validation annotations. Với PUBLISHED, title/description/location được sửa; thumbnail/start/end khác null bị từ chối, category bị bỏ qua. Đây là behavior source, không tự suy rộng PATCH thành mọi trường sửa được.

## TicketType (package ticket)

Nguồn: [TicketTypeController](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/controller/TicketTypeController.java). Học [ticket](../learning/modules/ticket.md); BR03/07/09.

| HTTP/path | Chức năng, quyền/ownership | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| POST /events/{eventId}/ticket-types | ADMIN hoặc chủ ORGANIZER; Event DRAFT | eventId + CreateTicketTypeRequest | TicketTypeResponse | createTicketType; 404 EVENT_NOT_FOUND, 403, 400, 409 TICKET_TYPE_ALREADY_EXIST |
| GET /events/{eventId}/ticket-types | authenticated; không lọc status/ownership trong service | eventId | List<TicketTypeResponse> | getTicketTypesByEvent; 404 EVENT_NOT_FOUND |
| GET /events/ticket-types/{ticketTypeId} | authenticated; không kiểm tra quyền event | ticketTypeId | TicketTypeResponse | getTicketTypeById; 404 TICKET_TYPE_NOT_FOUND |
| PATCH /events/ticket-types/{ticketTypeId} | ADMIN hoặc chủ ORGANIZER; DRAFT | ticketTypeId + UpdateTicketTypeRequest | TicketTypeResponse | updateTicketType; 404, 403, 400 INVALID_REQUEST, 409 trùng tên |
| DELETE /events/ticket-types/{ticketTypeId} | ADMIN hoặc chủ ORGANIZER; DRAFT, soldQuantity không >0 | ticketTypeId | Void | deleteTicketType; 404, 403, 400 INVALID_REQUEST |

Tên URL chi tiết loại vé nằm dưới `/events/ticket-types`, khác `/ticket-types/{id}/waitlist`. Không đổi path cho “đẹp” trong nhiệm vụ tài liệu.

## Booking và payment

Nguồn: [BookingController](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/controller/BookingController.java), [PaymentController](../../backend/src/main/java/com/eventhub/eventhub_backend/payment/controller/PaymentController.java). Học [booking](../learning/modules/booking.md), [payment](../learning/modules/payment.md); BR08–12.

| HTTP/path | Chức năng, quyền/ownership | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| POST /bookings | CUSTOMER; tạo pending, giữ tồn kho | CreateBookingRequest | BookingResponse | createBooking; 404 USER_NOT_FOUND/TICKET_TYPE_NOT_FOUND; 400 sai event/số lượng/hết chỗ |
| GET /bookings | CUSTOMER, chỉ của mình | Phân trang | PageResponse<BookingResponse> | getMyBookings |
| GET /bookings/{bookingId} | CUSTOMER chủ booking | bookingId | BookingResponse | getBooking; 404 BOOKING_NOT_FOUND, 403 UNAUTHORIZED |
| PATCH /bookings/{bookingId}/cancel | CUSTOMER chủ booking; chỉ pending | bookingId; không body | BookingResponse | cancelBooking; 404, 403, 400 INVALID_REQUEST |
| POST /payments/confirm | ADMIN; xác nhận thủ công pending | ConfirmPaymentRequest | PaymentResponse | confirmPayment; 404 BOOKING_NOT_FOUND, 400 reference sai booking/status; unique collision chưa handler riêng |

Không có API expire booking; đó là scheduler. Không có API checkout/refund/webhook. Replay confirm cùng reference cùng booking SUCCESS trả kết quả cũ, không phát thêm vé tuần tự; cancel lặp sau CANCELLED trả 400.

## Ticket (package ticketing)

Nguồn: [TicketController](../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/controller/TicketController.java). Học [ticketing](../learning/modules/ticketing.md); BR13–14.

| HTTP/path | Chức năng, quyền/ownership | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| GET /tickets | CUSTOMER, vé của mình | Phân trang | PageResponse<TicketResponse> | getMyTickets |
| GET /tickets/{ticketId} | CUSTOMER chủ vé | ticketId | TicketResponse | getMyTicket; 404 TICKET_NOT_FOUND, 403 |
| POST /tickets/check-in | ADMIN hoặc ORGANIZER sở hữu event; vé VALID | CheckInTicketRequest: ticketCode hoặc qrPayload; ưu tiên ticketCode | TicketResponse | checkInTicket; 400 INVALID_REQUEST nếu đã dùng/thiếu cả hai, 404 TICKET_NOT_FOUND, 403 |

Không có endpoint phát hành vé trực tiếp; PaymentService gọi TicketService. QR payload là chuỗi, không phải ảnh trả về.

## Waitlist

Nguồn: [WaitlistController](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/controller/WaitlistController.java). Học [waitlist](../learning/modules/waitlist.md); BR15–17.

| HTTP/path | Chức năng, quyền/ownership | Đầu vào | Kết quả T | Service/method; lỗi |
|---|---|---|---|---|
| POST /ticket-types/{ticketTypeId}/waitlist | CUSTOMER; loại vé PUBLISHED hết khả dụng, chưa entry active | ticketTypeId + JoinWaitlistRequest | WaitlistEntryResponse | WaitlistService.joinWaitlist; 404 user/type, 400 chưa hết vé/trùng active |
| GET /me/waitlist | CUSTOMER; entry của mình | Phân trang | PageResponse<WaitlistEntryResponse> | WaitlistService.getMyWaitlist |
| GET /me/waitlist-offers | CUSTOMER; offer của mình | Phân trang | PageResponse<WaitlistOfferResponse> | WaitlistOfferService.getMyOffers |
| POST /waitlist-offers/{offerId}/accept | CUSTOMER chủ offer; CREATED còn hạn hoặc replay đã converted | offerId; không body | WaitlistOfferResponse, bookingId khi converted | acceptOffer; 404 RESOURCE_NOT_FOUND, 403, 400 sai status/hết hạn/hết chỗ khi tạo booking |
| POST /waitlist-offers/{offerId}/skip | CUSTOMER chủ offer; CREATED hoặc replay SKIPPED | offerId; không body | WaitlistOfferResponse | skipOffer; 404, 403, 400 status khác |

CreateWaitlistOfferRequest tồn tại nhưng **không có controller mapping tạo offer**. `createOffer`/`offerNextEligibleEntry` là hợp đồng service nội bộ, không phải HTTP endpoint. Scheduler chỉ expire offer. Đây là khoảng thiếu nối luồng runtime, không tự thêm API tưởng tượng.
