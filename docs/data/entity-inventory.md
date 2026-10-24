# Bảng kiểm kê entity và đường dẫn source

Xem [database design](database-design.md) để hiểu nullability, owning side, fetch và cascade. Tên dưới đây là class/thuộc tính Java, không tự suy ra physical column name ngoài annotation.

## Booking

Nguồn: [Booking](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/entity/Booking.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `customer` | `User` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)` |
| `status` | `BookingStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `totalAmount` | `BigDecimal` | `@Column(nullable = false)` |
| `items` | `List<BookingItem>` | `@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)` |
| `payments` | `List<Payment>` | `@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)` |
| `tickets` | `List<Ticket>` | `@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)` |

## BookingItem

Nguồn: [BookingItem](../../backend/src/main/java/com/eventhub/eventhub_backend/booking/entity/BookingItem.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `booking` | `Booking` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booking_id", nullable = false)` |
| `ticketType` | `TicketType` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_type_id", nullable = false)` |
| `quantity` | `Integer` | `@Column(nullable = false)` |
| `unitPrice` | `BigDecimal` | `@Column(nullable = false)` |
| `subtotal` | `BigDecimal` | `@Column(nullable = false)` |

## BaseEntity

Nguồn: [BaseEntity](../../backend/src/main/java/com/eventhub/eventhub_backend/common/entity/BaseEntity.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `id` | `String` | `@Id @GeneratedValue(strategy = GenerationType.UUID)` |
| `createdAt` | `Instant` | `@CreatedDate @Column(nullable = false, updatable = false)` |
| `updatedAt` | `Instant` | `@LastModifiedDate @Column(nullable = false)` |

## Event

Nguồn: [Event](../../backend/src/main/java/com/eventhub/eventhub_backend/event/entity/Event.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `title` | `String` | `@Column(nullable = false)` |
| `description` | `String` | `@Column(columnDefinition = "TEXT")` |
| `thumbnailUrl` | `String` | `Không khai báo tại trường` |
| `category` | `String` | `Không khai báo tại trường` |
| `location` | `String` | `@Column(nullable = false)` |
| `startAt` | `Instant` | `@Column(nullable = false)` |
| `endAt` | `Instant` | `@Column(nullable = false)` |
| `status` | `EventStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `organizer` | `User` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "organizer_id", nullable = false)` |
| `ticketTypes` | `List<TicketType>` | `@OneToMany(mappedBy = "event")` |

## Payment

Nguồn: [Payment](../../backend/src/main/java/com/eventhub/eventhub_backend/payment/entity/Payment.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `booking` | `Booking` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booking_id", nullable = false)` |
| `amount` | `BigDecimal` | `@Column(nullable = false)` |
| `status` | `PaymentStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `provider` | `String` | `@Column(nullable = false)` |
| `providerTransactionId` | `String` | `@Column(name = "provider_transaction_id", nullable = false)` |
| `paidAt` | `Instant` | `Không khai báo tại trường` |

## TicketType

Nguồn: [TicketType](../../backend/src/main/java/com/eventhub/eventhub_backend/ticket/entity/TicketType.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `name` | `String` | `Không khai báo tại trường` |
| `description` | `String` | `Không khai báo tại trường` |
| `price` | `BigDecimal` | `Không khai báo tại trường` |
| `quantity` | `Integer` | `Không khai báo tại trường` |
| `soldQuantity` | `Integer` | `Không khai báo tại trường` |
| `event` | `Event` | `@ManyToOne @JoinColumn(name = "event_id")` |

## Ticket

Nguồn: [Ticket](../../backend/src/main/java/com/eventhub/eventhub_backend/ticketing/entity/Ticket.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `ticketCode` | `String` | `@Column(nullable = false, unique = true)` |
| `qrPayload` | `String` | `@Column(nullable = false)` |
| `status` | `TicketStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `booking` | `Booking` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booking_id", nullable = false)` |
| `ticketType` | `TicketType` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_type_id", nullable = false)` |
| `customer` | `User` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)` |
| `checkedInAt` | `Instant` | `Không khai báo tại trường` |

## User

Nguồn: [User](../../backend/src/main/java/com/eventhub/eventhub_backend/user/entity/User.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `email` | `String` | `@Column(nullable = false, unique = true)` |
| `password` | `String` | `@Column(nullable = false)` |
| `fullName` | `String` | `@Column(nullable = false)` |
| `phone` | `String` | `Không khai báo tại trường` |
| `avatarUrl` | `String` | `Không khai báo tại trường` |
| `role` | `Role` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `status` | `Status` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |

## WaitlistEntry

Nguồn: [WaitlistEntry](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/entity/WaitlistEntry.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `customer` | `User` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)` |
| `ticketType` | `TicketType` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_type_id", nullable = false)` |
| `quantity` | `Integer` | `@Column(nullable = false)` |
| `status` | `WaitlistEntryStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |

## WaitlistOffer

Nguồn: [WaitlistOffer](../../backend/src/main/java/com/eventhub/eventhub_backend/waitlist/entity/WaitlistOffer.java).

| Thuộc tính Java | Kiểu | Khai báo mapping/constraint |
|---|---|---|
| `waitlistEntry` | `WaitlistEntry` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "waitlist_entry_id", nullable = false)` |
| `ticketType` | `TicketType` | `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_type_id", nullable = false)` |
| `quantity` | `Integer` | `@Column(nullable = false)` |
| `status` | `WaitlistOfferStatus` | `@Enumerated(EnumType.STRING) @Column(nullable = false)` |
| `expiresAt` | `Instant` | `@Column(nullable = false)` |
| `acceptedAt` | `Instant` | `Không khai báo tại trường` |
| `convertedBookingId` | `String` | `Không khai báo tại trường` |
