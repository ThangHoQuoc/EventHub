# Triển khai và vận hành: hiện trạng

**ĐÃ XÁC MINH:** Compose chỉ có PostgreSQL 17, restart unless-stopped, host port 5433 ánh xạ tới cổng 5432 trong container và named volume. Backend có Spring Boot Maven plugin và Actuator dependency. Entry point UTC; Compose đặt timezone Asia/Ho_Chi_Minh cho DB. So sánh Instant theo UTC, chuyển giờ khi trình bày cho người dùng; không giả định timezone DB và ứng dụng giống nhau.

**KHOẢNG THIẾU:** chưa có Dockerfile backend, manifest production, pipeline CI/CD, migration versioned hoặc monitoring/alerting cụ thể được chứng minh trong backend. Có Actuator dependency không chứng minh endpoint được expose/permit công khai; SecurityConfig vẫn authenticated với URL không allowlist.

## Cơ chế tác vụ định kỳ

EventScheduler: mỗi 60 giây gọi completeExpiredEvents. BookingScheduler: mỗi 60 giây expire pending trước now-900 giây. WaitlistScheduler: mỗi 60 giây expireCreatedOffers(now). Scheduler chạy cùng process và cần context đang sống. Chưa thấy distributed lock, job persistence, retry policy hay thông báo thất bại riêng.

## Hướng triển khai đề xuất

Đầu tiên chọn một instance backend + PostgreSQL, cung cấp secret qua môi trường, đóng gói jar theo POM, xác minh health/permission với môi trường thử. Chuyển schema từ ddl-auto=update sang migration cần một task riêng có kiểm tra dữ liệu hiện hữu và rollback, không đổi cấu hình trong nhiệm vụ docs. Khi chạy nhiều instance, phải chứng minh job và chuyển trạng thái idempotent/concurrency-safe trước khi bật replica.

Backup/restore phải được diễn tập với dữ liệu thử; không ghi backup chứa dữ liệu thật vào repo. Theo dõi booking pending quá tuổi, payment confirmed không đủ vé và số lần reserve bị từ chối là tín hiệu nghiệp vụ hữu ích **đề xuất**, chưa có metric đó. Chưa cần Kafka/Redis nếu vấn đề là thiếu atomic transition trong cùng database.

Không chạy `docker compose down -v`, reset DB hoặc clean Git trong quá trình đọc tài liệu. Lệnh build/run chưa được kiểm chứng runtime production; xem [biên bản](../project/verification.md).
