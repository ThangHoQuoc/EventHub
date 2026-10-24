# ADR-004: Ghi nhận backend đơn khối phân lớp theo tính năng

## Trạng thái

Ngày 09/10/2026. **Ghi nhận hiện trạng và phân tích kỹ thuật**, không xác nhận lý do lịch sử của người viết.

## Bối cảnh và lựa chọn đang tồn tại

Backend có một POM, entry point, Spring context và tập entity dùng cùng datasource. Controller → service → repository lặp lại trong các package auth/event/booking/...; module truy cập entity/repository nhau và một số service gọi chéo. Chưa có giao thức mạng giữa module hoặc deployment độc lập.

## Phân tích

Giữ cấu trúc hiện tại cho phép giao dịch booking/payment/ticket trong một database, debug một process và triển khai đơn giản. Clean/Hexagonal Architecture có thể cô lập domain khỏi framework nhưng thêm port/adapter và mapping; chưa cần thêm lớp nếu không có phụ thuộc cần thay thế. Microservices cho phép deploy độc lập nhưng biến transaction nội bộ thành bài toán nhất quán phân tán, làm tăng vận hành và kiểm thử.

## Hệ quả và điều kiện xem xét lại

Chấp nhận coupling entity hiện tại khi hệ thống còn nhỏ. Trước khi tách, cần đo phạm vi thay đổi, bottleneck và nhu cầu sở hữu/triển khai độc lập. Nếu module bắt đầu gây sửa lan rộng, trước hết có thể làm rõ service contracts và kiểm tra dependency trong cùng process. Không thêm Kafka/Redis chỉ để đạt một nhãn kiến trúc.

Nguồn: [module index](../architecture/module-index.md), [POM](../../backend/pom.xml), [entry point](../../backend/src/main/java/com/eventhub/eventhub_backend/EventhubBackendApplication.java).
