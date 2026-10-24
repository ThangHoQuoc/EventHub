# Kiểm kê repository EventHub

Ngày khảo sát: 09/10/2026. Phạm vi là backend trong working tree, gồm thay đổi chưa commit; HEAD là `8f258e2d7c4397200e9273f1ec0f7336e6559b9a`.

**ĐÃ XÁC MINH:** Có các package nghiệp vụ `auth`, `user`, `event`, `ticket`, `booking`, `payment`, `ticketing`, `waitlist`; `common`, `config`, `util`, `admin` hỗ trợ. `util/StringUtils.java` rỗng; `admin` chỉ có endpoint thử quyền nên được học cùng common/config. Frontend có React/Vite nhưng không thuộc phạm vi giáo trình backend.

## Phạm vi bằng chứng

Đã đọc POM, application entry point, cấu hình ứng dụng/test, tất cả controller, service implementation, entity, DTO, mapper, repository nghiệp vụ, exception handler và scheduler. Đã đối chiếu danh sách test và đọc các test đại diện. Không truy cập PostgreSQL đang chạy, không khẳng định schema thực tế trùng annotation.

## Tài liệu cần giữ

- `01-PRODUCT-REQUIREMENTS.md`: yêu cầu sản phẩm, không phải bằng chứng đã implement.
- `docs/EVENTHUB_PROJECT_MASTER_DOC.md`: tài liệu tổng hợp cũ, có mục tiêu Kafka/Redis/AI chưa thấy implementation.
- `docs/GIT_WORKFLOW_GUIDE.md`: hướng dẫn Git cũ; nhiệm vụ này không đổi branch.
- `docs/decisions/ADR-001-buyer-side-eventmatch-and-smart-waitlist.md`: quyết định định hướng sản phẩm.
- `docs/decisions/ADR-002-booking-inventory-reservation.md`: lịch sử booking chưa giữ tồn kho; source working tree đã khác.
- `docs/FRONTEND_UI_SPEC.md`: tài liệu có sẵn chưa commit, giữ nguyên.
- `backend/HELP.md`: hướng dẫn sinh tự động; liên kết Boot 4.1.1 không trùng POM Boot 3.5.0.

## Vùng cần kiểm chứng sâu

Thanh toán cạnh tranh với hủy/hết hạn booking; hai lượt check-in cùng lúc; bulk update và persistence context; rollback của accept offer đã hết hạn; cơ chế gọi tạo offer; các ràng buộc thực tế trong PostgreSQL. Xem [hiện trạng và khoảng thiếu](../roadmap/current-state-and-gaps.md).

## Công cụ sơ đồ

Đã kiểm tra MCP và công cụ cục bộ: có Pencil cho thiết kế giao diện; không tìm thấy `dot`, `d2`, `mmdc` trên PATH. Chọn SVG sinh bằng Python standard library, giữ dữ liệu sơ đồ và bộ render trong `docs/assets/diagrams/sources/`, không cài dependency. Sơ đồ dùng cho context, phụ thuộc module, luồng từng bài học, vòng đời và quan hệ dữ liệu.

## Kiểm kê chi tiết

Xem [module index](../architecture/module-index.md), [API catalog](../api/endpoint-catalog.md), [database](../data/database-design.md) và [checklist giáo trình](../learning/modules/README.md). Đây là các chỉ mục chuyên biệt, không cần đọc toàn bộ cho mỗi task.
