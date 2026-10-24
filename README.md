# EventHub — backend quản lý sự kiện và bán vé

EventHub hỗ trợ đăng ký/đăng nhập, quản lý và công bố sự kiện, cấu hình loại vé, đặt vé có giữ tồn kho, xác nhận thanh toán thủ công, phát hành vé/check-in và một phần danh sách chờ. Backend dùng Java 21, Spring Boot 3.5.0 và PostgreSQL; frontend React/Vite nằm ở `frontend/`.

> Tài liệu phản ánh **working tree ngày 09/10/2026**, gồm code chưa commit. Thanh toán chưa tích hợp provider thực; EventMatch, Kafka và Redis chưa có bằng chứng implementation trong backend. Xem [hiện trạng](docs/roadmap/current-state-and-gaps.md).

## Bắt đầu

1. Đọc [hướng dẫn local](docs/development/local-setup.md), kiểm tra JDK 21, Maven và Docker.
2. Chuẩn bị PostgreSQL bằng Compose trong `backend/`, cấu hình bí mật bên ngoài repository.
3. Chạy từ `backend/`: `mvn spring-boot:run` hoặc `.\mvnw.cmd spring-boot:run`.
4. Chạy test: `mvn test` với JWT secret tạm; test sử dụng H2.

Các lệnh chạy server/Compose là hướng dẫn từ cấu hình, chưa được chạy trong nhiệm vụ docs. Kết quả kiểm tra thực tế được ghi tại [biên bản kiểm chứng](docs/project/verification.md).

## Chọn điểm vào

- Người mới học: [lộ trình học backend](docs/learning/learning-path.md).
- Hiểu nghiệp vụ trước: [domain](docs/domain/domain-overview.md), [business rules](docs/domain/business-rules.md).
- Tìm code để làm việc: [module index](docs/architecture/module-index.md).
- Tra cứu API: [endpoint catalog](docs/api/endpoint-catalog.md).
- Đọc toàn bộ bản đồ tài liệu: [docs/README.md](docs/README.md).
- AI làm task cụ thể: [AGENTS.md](AGENTS.md), [routing](docs/ai/documentation-routing.md).

Tài liệu yêu cầu sản phẩm cũ ở [01-PRODUCT-REQUIREMENTS.md](01-PRODUCT-REQUIREMENTS.md) vẫn được giữ để đối chiếu mục tiêu với hiện trạng. Không dùng roadmap như bằng chứng tính năng đã chạy.
