# Hợp đồng DTO và validation

**ĐÃ XÁC MINH:** bảng trích thuộc tính và annotation trực tiếp từ DTO source ngày 09/10/2026. Annotation ghi bằng identifier để tìm trong code; tên trường không dịch. Không có annotation nghĩa là DTO không khai báo constraint tại trường đó, không có nghĩa service không kiểm tra. `@Valid` trên CreateBookingRequest.items kích hoạt validation lồng; CheckInTicketRequest không có constraint trường nên service kiểm tra có ít nhất một mã.

Đối chiếu [catalog](endpoint-catalog.md) để biết DTO được endpoint nào sử dụng. CreateWaitlistOfferRequest hiện chỉ được service nội bộ dùng; annotation của nó không tự chạy khi gọi method Java trực tiếp.

## LoginRequest

Nguồn: [LoginRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/auth/dto/request/LoginRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `email` | `String` | `@NotBlank(message = "Email is required") @Email(message = "Invalid email")` |
| `password` | `String` | `@NotBlank(message = "Password is required")` |

## RegisterRequest

Nguồn: [RegisterRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/auth/dto/request/RegisterRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `email` | `String` | `@NotBlank(message = "Email is required") @Email` |
| `password` | `String` | `@NotBlank(message = "Password is required") @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")` |
| `fullName` | `String` | `@NotBlank(message = "FullName is required") @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")` |
| `phone` | `String` | `Không khai báo` |

## LoginResponse

Nguồn: [LoginResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/auth/dto/response/LoginResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `accessToken` | `String` | `Không khai báo` |
| `tokenType` | `String` | `Không khai báo` |
| `expiresIn` | `long` | `Không khai báo` |

## RegisterResponse

Nguồn: [RegisterResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/auth/dto/response/RegisterResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `email` | `String` | `Không khai báo` |
| `fullName` | `String` | `Không khai báo` |
| `phone` | `String` | `Không khai báo` |
| `avatarUrl` | `String` | `Không khai báo` |
| `role` | `Role` | `Không khai báo` |
| `status` | `Status` | `Không khai báo` |

## BookingItemRequest

Nguồn: [BookingItemRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/dto/request/BookingItemRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `ticketTypeId` | `String` | `@NotBlank` |
| `quantity` | `Integer` | `@NotNull @Positive` |

## CreateBookingRequest

Nguồn: [CreateBookingRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/dto/request/CreateBookingRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `items` | `List<BookingItemRequest>` | `@Valid @NotEmpty` |

## BookingItemResponse

Nguồn: [BookingItemResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/dto/response/BookingItemResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `ticketTypeId` | `String` | `Không khai báo` |
| `ticketTypeName` | `String` | `Không khai báo` |
| `eventId` | `String` | `Không khai báo` |
| `eventTitle` | `String` | `Không khai báo` |
| `quantity` | `Integer` | `Không khai báo` |
| `unitPrice` | `BigDecimal` | `Không khai báo` |
| `subtotal` | `BigDecimal` | `Không khai báo` |

## BookingResponse

Nguồn: [BookingResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/dto/response/BookingResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `customerId` | `String` | `Không khai báo` |
| `status` | `BookingStatus` | `Không khai báo` |
| `totalAmount` | `BigDecimal` | `Không khai báo` |
| `createdAt` | `Instant` | `Không khai báo` |
| `items` | `List<BookingItemResponse>` | `Không khai báo` |

## CreateEventRequest

Nguồn: [CreateEventRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/event/dto/request/CreateEventRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `title` | `String` | `@NotBlank` |
| `description` | `String` | `@NotBlank` |
| `thumbnailUrl` | `String` | `Không khai báo` |
| `category` | `String` | `Không khai báo` |
| `location` | `String` | `@NotBlank` |
| `startAt` | `Instant` | `@NotNull @Future` |
| `endAt` | `Instant` | `@NotNull @Future` |

## EventSearchRequest

Nguồn: [EventSearchRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/event/dto/request/EventSearchRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `keyword` | `String` | `Không khai báo` |
| `location` | `String` | `Không khai báo` |
| `category` | `String` | `Không khai báo` |
| `startAt` | `Instant` | `Không khai báo` |
| `endAt` | `Instant` | `Không khai báo` |

## UpdateEventRequest

Nguồn: [UpdateEventRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/event/dto/request/UpdateEventRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `title` | `String` | `Không khai báo` |
| `description` | `String` | `Không khai báo` |
| `thumbnailUrl` | `String` | `Không khai báo` |
| `category` | `String` | `Không khai báo` |
| `location` | `String` | `Không khai báo` |
| `startAt` | `Instant` | `Không khai báo` |
| `endAt` | `Instant` | `Không khai báo` |

## EventResponse

Nguồn: [EventResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/event/dto/response/EventResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `title` | `String` | `Không khai báo` |
| `description` | `String` | `Không khai báo` |
| `thumbnailUrl` | `String` | `Không khai báo` |
| `category` | `String` | `Không khai báo` |
| `location` | `String` | `Không khai báo` |
| `startAt` | `Instant` | `Không khai báo` |
| `endAt` | `Instant` | `Không khai báo` |
| `status` | `EventStatus` | `Không khai báo` |
| `organizerId` | `String` | `Không khai báo` |
| `createdAt` | `Instant` | `Không khai báo` |
| `updatedAt` | `Instant` | `Không khai báo` |

## ConfirmPaymentRequest

Nguồn: [ConfirmPaymentRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/payment/dto/request/ConfirmPaymentRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `bookingId` | `String` | `@NotBlank(message = "Booking id is required")` |
| `provider` | `String` | `@NotBlank(message = "Payment provider is required")` |
| `providerTransactionId` | `String` | `@NotBlank(message = "Provider transaction id is required")` |

## PaymentResponse

Nguồn: [PaymentResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/payment/dto/response/PaymentResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `bookingId` | `String` | `Không khai báo` |
| `amount` | `BigDecimal` | `Không khai báo` |
| `status` | `PaymentStatus` | `Không khai báo` |
| `provider` | `String` | `Không khai báo` |
| `providerTransactionId` | `String` | `Không khai báo` |
| `paidAt` | `Instant` | `Không khai báo` |
| `bookingStatus` | `BookingStatus` | `Không khai báo` |

## CreateTicketTypeRequest

Nguồn: [CreateTicketTypeRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/request/CreateTicketTypeRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `name` | `String` | `@NotBlank` |
| `description` | `String` | `Không khai báo` |
| `price` | `BigDecimal` | `@NotNull @Positive` |
| `quantity` | `Integer` | `@NotNull @Positive` |

## UpdateTicketTypeRequest

Nguồn: [UpdateTicketTypeRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/request/UpdateTicketTypeRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `name` | `String` | `@Size(min = 1, max = 100)` |
| `description` | `String` | `Không khai báo` |
| `price` | `BigDecimal` | `@Positive` |
| `quantity` | `Integer` | `@Positive` |

## TicketTypeResponse

Nguồn: [TicketTypeResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/dto/response/TicketTypeResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `eventId` | `String` | `Không khai báo` |
| `name` | `String` | `Không khai báo` |
| `description` | `String` | `Không khai báo` |
| `price` | `BigDecimal` | `Không khai báo` |
| `quantity` | `Integer` | `Không khai báo` |
| `soldQuantity` | `Integer` | `Không khai báo` |
| `availableQuantity` | `Integer` | `Không khai báo` |

## CheckInTicketRequest

Nguồn: [CheckInTicketRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/dto/request/CheckInTicketRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `ticketCode` | `String` | `Không khai báo` |
| `qrPayload` | `String` | `Không khai báo` |

## TicketResponse

Nguồn: [TicketResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/dto/response/TicketResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `ticketCode` | `String` | `Không khai báo` |
| `qrPayload` | `String` | `Không khai báo` |
| `status` | `TicketStatus` | `Không khai báo` |
| `bookingId` | `String` | `Không khai báo` |
| `customerId` | `String` | `Không khai báo` |
| `ticketTypeId` | `String` | `Không khai báo` |
| `ticketTypeName` | `String` | `Không khai báo` |
| `eventId` | `String` | `Không khai báo` |
| `eventTitle` | `String` | `Không khai báo` |
| `issuedAt` | `Instant` | `Không khai báo` |
| `checkedInAt` | `Instant` | `Không khai báo` |

## UserResponse

Nguồn: [UserResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/user/dto/response/UserResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `email` | `String` | `Không khai báo` |
| `fullName` | `String` | `Không khai báo` |
| `phone` | `String` | `Không khai báo` |
| `avatarUrl` | `String` | `Không khai báo` |
| `role` | `Role` | `Không khai báo` |
| `status` | `Status` | `Không khai báo` |
| `createdAt` | `Instant` | `Không khai báo` |
| `updatedAt` | `Instant` | `Không khai báo` |

## CreateWaitlistOfferRequest

Nguồn: [CreateWaitlistOfferRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/dto/request/CreateWaitlistOfferRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `waitlistEntryId` | `String` | `@NotBlank(message = "Waitlist entry id is required")` |
| `quantity` | `Integer` | `@NotNull(message = "Quantity is required") @Min(value = 1, message = "Quantity must be greater than 0")` |
| `expiresAt` | `Instant` | `@NotNull(message = "Expires at is required") @Future(message = "Expires at must be in the future")` |

## JoinWaitlistRequest

Nguồn: [JoinWaitlistRequest](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/dto/request/JoinWaitlistRequest.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `quantity` | `Integer` | `@NotNull(message = "Quantity is required") @Min(value = 1, message = "Quantity must be greater than 0")` |

## WaitlistEntryResponse

Nguồn: [WaitlistEntryResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/dto/response/WaitlistEntryResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `customerId` | `String` | `Không khai báo` |
| `ticketTypeId` | `String` | `Không khai báo` |
| `ticketTypeName` | `String` | `Không khai báo` |
| `eventId` | `String` | `Không khai báo` |
| `eventTitle` | `String` | `Không khai báo` |
| `quantity` | `Integer` | `Không khai báo` |
| `status` | `WaitlistEntryStatus` | `Không khai báo` |
| `createdAt` | `Instant` | `Không khai báo` |

## WaitlistOfferResponse

Nguồn: [WaitlistOfferResponse](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/dto/response/WaitlistOfferResponse.java).

| Trường | Kiểu Java | Annotation tại trường |
|---|---|---|
| `id` | `String` | `Không khai báo` |
| `waitlistEntryId` | `String` | `Không khai báo` |
| `customerId` | `String` | `Không khai báo` |
| `ticketTypeId` | `String` | `Không khai báo` |
| `ticketTypeName` | `String` | `Không khai báo` |
| `eventId` | `String` | `Không khai báo` |
| `eventTitle` | `String` | `Không khai báo` |
| `quantity` | `Integer` | `Không khai báo` |
| `status` | `WaitlistOfferStatus` | `Không khai báo` |
| `expiresAt` | `Instant` | `Không khai báo` |
| `acceptedAt` | `Instant` | `Không khai báo` |
| `bookingId` | `String` | `Không khai báo` |
| `createdAt` | `Instant` | `Không khai báo` |
