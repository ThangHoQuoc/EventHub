# Thiết kế dữ liệu JPA

**ĐÃ XÁC MINH từ annotation, chưa truy vấn schema PostgreSQL.** Có 9 entity cụ thể, cùng kế thừa BaseEntity: id String sinh UUID; createdAt NOT NULL, không update; updatedAt NOT NULL, JPA auditing. `@MappedSuperclass` không tạo bảng BaseEntity riêng.

Không tìm thấy Flyway/Liquibase, migration hay DDL SQL trong backend. Cấu hình main dùng `ddl-auto=update`; test dùng H2/create-drop. Source hiện mô tả schema dự kiến bằng entity; chưa có migration versioned làm source of truth triển khai. Không khẳng định constraint trên DB thật chỉ vì annotation có khai báo.

## Bảng và thuộc tính

Tên bảng và JoinColumn dưới đây được khai báo tường minh. Các thuộc tính camelCase không có @Column(name=...) là **tên Java**; physical column name do naming strategy quyết định, chưa xác minh DB thật.

| Entity / table | Thuộc tính quan trọng và ràng buộc khai báo |
|---|---|
| User / users | email NOT NULL UNIQUE; password/fullName NOT NULL; phone/avatarUrl tùy chọn; role/status enum STRING NOT NULL |
| Event / events | title/location/startAt/endAt/status NOT NULL; description TEXT nhưng nullable; thumbnailUrl/category nullable; organizer_id NOT NULL |
| TicketType / ticket_types | name/description/price/quantity/soldQuantity không có NOT NULL/UNIQUE/CHECK riêng; event_id nullable; service khởi tạo soldQuantity=0 |
| Booking / bookings | customer_id NOT NULL; status enum STRING NOT NULL; totalAmount NOT NULL |
| BookingItem / booking_items | booking_id/ticket_type_id NOT NULL; quantity/unitPrice/subtotal NOT NULL; chưa unique booking+type hay CHECK số lượng |
| Payment / payments | booking_id/amount/status/provider/provider_transaction_id NOT NULL; paidAt nullable; UNIQUE(provider,provider_transaction_id) tên uk_payments_provider_transaction |
| Ticket / issued_tickets | ticketCode NOT NULL UNIQUE; qrPayload/status NOT NULL; booking_id/ticket_type_id/customer_id NOT NULL; checkedInAt nullable |
| WaitlistEntry / waitlist_entries | customer_id/ticket_type_id/quantity/status NOT NULL; không khai báo unique active entry |
| WaitlistOffer / waitlist_offers | waitlist_entry_id/ticket_type_id/quantity/status/expiresAt NOT NULL; acceptedAt/convertedBookingId nullable; convertedBookingId chỉ String, không phải @ManyToOne/FK |

BigDecimal dùng cho tiền, nhưng không thấy khai báo precision/scale/currency riêng. Không tự công bố độ chính xác cột hoặc quy tắc làm tròn. Enum STRING dễ đọc hơn ordinal khi thêm trạng thái, nhưng đổi tên enum có thể cần chuyển dữ liệu.

## Quan hệ, fetch và cascade

- Event.organizer, Booking.customer, BookingItem.booking/ticketType, Payment.booking, Ticket.booking/ticketType/customer, WaitlistEntry.customer/ticketType, WaitlistOffer.waitlistEntry/ticketType: ManyToOne LAZY, owning side có JoinColumn.
- TicketType.event: ManyToOne không chỉ định fetch, mặc định JPA EAGER. Đây là khác biệt có thể làm query tải thêm Event.
- Event.ticketTypes: OneToMany mappedBy=event, không cascade khai báo.
- Booking.items/payments/tickets: OneToMany mappedBy=booking, cascade ALL và orphanRemoval=true; collection mặc định LAZY.
- `mappedBy` là phía inverse; chỉ thêm item vào list không thay thế việc gán item.booking. createBooking gán cả hai để cascade persist đúng.
- Không có @Version hay @Index trên các entity đã đọc. UNIQUE thường tạo cấu trúc index ở DB nhưng chưa kiểm tra implementation/DDL thực; FK không mặc định bảo đảm mọi index truy vấn cần thiết.

Nguồn entity được liên kết tại [entity inventory](entity-inventory.md); [ER](entity-relationships.md) và [transaction](transaction-and-data-integrity.md) giải thích các nguy cơ khi thao tác dữ liệu.
