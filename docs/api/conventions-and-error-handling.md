# Quy ước HTTP, phân trang và lỗi

`ApiResponse<T>` có code (mặc định 1000), message và result; `PageResponse<T>` có content/page/size/totalElements/totalPages/first/last. Không trả entity trực tiếp. Authentication header là `Authorization: Bearer <token do môi trường thử cấp>`; không lưu token trong docs.

## Status và error code

| Code/enum | HTTP | Ý nghĩa |
|---|---|---|
| 1000 SUCCESS | 200 mặc định | Không quyết định HTTP status; createEvent khai báo 201 riêng |
| 1001 USER_EXISTED | 409 | Email đã có |
| 1002 USER_NOT_FOUND | 404 | Không tìm thấy user |
| 1003 INVALID_PASSWORD | 401 | Mật khẩu sai |
| 1004 UNAUTHENTICATED | 401 | Chưa xác thực |
| 1005 UNAUTHORIZED | 403 | Không có quyền |
| 1006 INVALID_REQUEST | 400 | Vi phạm rule hoặc input service không hợp lệ |
| 1007 VALIDATION_ERROR | 400 | MVC validation lỗi; result là map field → message |
| 1008 RESOURCE_NOT_FOUND | 404 | Tài nguyên chung/offer không thấy |
| 1009 METHOD_NOT_ALLOWED | 405 | HTTP method không hỗ trợ |
| 1010 EVENT_NOT_FOUND | 404 | Event không thấy hoặc bị ẩn với caller |
| 1011 EVENT_CANNOT_BE_UPDATED | 400 | Trạng thái event không cho thao tác |
| 1012 TICKET_TYPE_ALREADY_EXIST | 409 | Trùng tên loại vé ở application layer |
| 1013 TICKET_TYPE_NOT_FOUND | 404 | Loại vé không thấy |
| 1014 BOOKING_NOT_FOUND | 404 | Booking không thấy |
| 1015 TICKET_NOT_FOUND | 404 | Ticket không thấy |
| 9999 INTERNAL_SERVER_ERROR | 500 | Có enum, **chưa có generic exception handler** sử dụng nó |

Nguồn: [ErrorCode](../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/ErrorCode.java), [GlobalExceptionHandler](../../backend/src/main/java/com/eventhub/eventhub_backend/common/exception/GlobalExceptionHandler.java). Handler bắt MethodArgumentNotValidException, AppException, NoResourceFoundException và HttpRequestMethodNotSupportedException. Chưa có handler riêng cho malformed JSON, enum/date bind, DataIntegrityViolationException hoặc mọi lỗi hệ thống; không hứa tất cả lỗi đều cùng envelope.

## Phân trang/sort

Spring bind Pageable từ page/size/sort. `/events/public` khai báo size=10, createdAt DESC; các API khác không override bằng @PageableDefault. Không suy ra cùng default cho mọi endpoint. Search tự áp offset/limit và count query; `event.get(sort.getProperty())` chưa whitelist thuộc tính. Sort sai có thể gây lỗi chưa chuẩn hóa; thứ tự không ổn định nếu không sort hoặc thiếu tie-break.

Query EventSearchRequest có keyword/location/category/startAt/endAt; chỉ tìm PUBLISHED. keyword match title hoặc description bằng LIKE không phân biệt hoa thường; location LIKE; category bằng nhau; startAt là cận dưới thời điểm bắt đầu, endAt là cận trên kết thúc, không phải truy vấn mọi event giao nhau khoảng thời gian.

## Retry và idempotency

GET không chủ động sửa state nghiệp vụ. Booking POST chưa deduplicate request. Payment deduplicate theo provider/reference ở service và unique annotation; chưa chuẩn hóa lỗi hai insert cùng reference. Accept đã converted/skip đã skipped trả lại offer; check-in lặp vé USED trả 400. Không dùng cùng chiến lược retry cho mọi POST. Xem [transaction/concurrency](../data/transaction-and-data-integrity.md).

## Accept offer hết hạn

Phase 8 giữ phản hồi INVALID_REQUEST hiện có. Riêng nhánh quá hạn commit EXPIRED cho entry/offer bằng exception chuyên biệt; lỗi reserve Booking vẫn rollback accept. Xem [ADR-006](../decisions/ADR-006-waitlist-runtime-and-offer-transitions.md).
