# Tổng quan dự án

Một ban tổ chức cần công bố chương trình và bán các loại vé khác nhau. Người tham dự cần tìm chương trình, đặt số lượng vé, được xác nhận đã trả tiền và dùng vé vào cửa. EventHub biểu diễn hành trình đó bằng Event → TicketType → Booking/BookingItem → Payment → Ticket. WaitlistEntry/WaitlistOffer bổ sung cơ hội mua khi loại vé đã hết khả dụng.

**ĐÃ XÁC MINH:** một ứng dụng Spring Boot, một POM backend, các package chức năng cùng truy cập một mô hình JPA. PostgreSQL 17 có Compose; H2 phục vụ test. Java 21 là phiên bản yêu cầu từ POM. Entry point bật scheduling và JPA auditing, đặt timezone mặc định UTC.

**SUY LUẬN:** cấu trúc phù hợp một backend đơn khối phân lớp theo tính năng. Chưa có bằng chứng ranh giới module độc lập, nên không khẳng định Clean Architecture hay microservices.

## Những gì hệ thống đã biểu diễn

CUSTOMER mua và xem dữ liệu của mình. ORGANIZER quản lý sự kiện thuộc sở hữu và check-in vé của sự kiện đó. ADMIN có quyền quản trị ở các thao tác đã khai báo và xác nhận payment. Có enum trạng thái tài khoản nhưng chưa có controller quản trị tài khoản đầy đủ. Địa điểm là chuỗi `Event.location`, không phải entity Venue. Giá dùng BigDecimal; chưa thấy currency, thuế, phí hoặc hoàn tiền.

## Ranh giới sản phẩm

Thanh toán hiện là ghi nhận xác nhận do ADMIN gửi, không chứng minh có tiền thực chuyển qua ngân hàng. QR là payload chuỗi, không có bộ sinh ảnh QR trong backend. Waitlist có service chọn người đủ điều kiện và scheduler hết hạn, nhưng chưa thấy luồng runtime gọi cấp offer khi vé được giải phóng. EventMatch mới có định hướng tài liệu; search hiện là Criteria API.

Xem [use case](scope-and-use-cases.md), [kiến trúc](../architecture/architecture-overview.md) và [bản kiểm kê](survey.md). Không dùng README như hợp đồng API chi tiết.
