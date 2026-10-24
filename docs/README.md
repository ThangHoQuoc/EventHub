# Bản đồ tài liệu EventHub

Hai lớp tài liệu phục vụ hai cách đọc: AI chọn vài file liên quan để thực hiện task; người học đi theo giáo trình và mở source tại từng bước. Các tài liệu dưới đây viết theo working tree 09/10/2026, không chỉ theo HEAD.

## Định hướng dự án

- [Tổng quan](project/project-overview.md), [phạm vi và use case](project/scope-and-use-cases.md).
- [Kiểm kê source và tài liệu cũ](project/survey.md), [biên bản kiểm chứng](project/verification.md).
- [Thuật ngữ nghiệp vụ và kỹ thuật](project/glossary.md).

## Tham chiếu nghiệp vụ và kỹ thuật

| Cần hiểu | Tài liệu |
|---|---|
| Người dùng mua vé như thế nào | [Domain](domain/domain-overview.md), [quy tắc](domain/business-rules.md), [vòng đời](domain/lifecycle-and-state-transitions.md) |
| Ứng dụng được tổ chức ra sao | [Context](architecture/system-context.md), [kiến trúc](architecture/architecture-overview.md), [module index](architecture/module-index.md), [luồng lớn](architecture/major-flows.md) |
| Client gọi backend | [API overview](api/api-overview.md), [catalog](api/endpoint-catalog.md), [DTO contracts](api/dto-contracts.md), [lỗi/quy ước](api/conventions-and-error-handling.md) |
| Lưu dữ liệu và tránh sai lệch | [Database](data/database-design.md), [quan hệ](data/entity-relationships.md), [transaction](data/transaction-and-data-integrity.md) |
| Ai được phép làm gì | [Security model](security/security-model.md) |
| Chạy và vận hành | [Local](development/local-setup.md), [lệnh/test](development/commands-and-testing.md), [deployment](development/deployment-and-operations.md) |
| Cần phát triển gì tiếp | [Hiện trạng](roadmap/current-state-and-gaps.md), [các phase đề xuất](roadmap/development-phases.md) |

## Học và làm việc với AI

- [Giáo trình](learning/README.md), [lộ trình](learning/learning-path.md), [checklist từng module](learning/modules/README.md).
- [Routing cho AI](ai/documentation-routing.md), [handoff](ai/handoff.md).
- [Cách sửa và render hình](assets/diagrams/README.md).
- ADR mới: [ADR-003: tồn kho trong working tree](decisions/ADR-003-current-inventory-semantics.md), [ADR-004: kiến trúc hiện tại](decisions/ADR-004-layered-backend.md).

## Cách đọc độ tin cậy

**ĐÃ XÁC MINH** là bằng chứng source/config/test cụ thể; không đồng nghĩa đã chạy production. **SUY LUẬN** là phân tích từ code cần kiểm chứng thêm. **KHOẢNG THIẾU** là chưa có implementation hoặc chưa đủ bằng chứng. **ĐỀ XUẤT** là thay đổi tương lai chưa được quyết định.

Tài liệu lịch sử được giữ nguyên ở `EVENTHUB_PROJECT_MASTER_DOC.md`, `GIT_WORKFLOW_GUIDE.md`, `FRONTEND_UI_SPEC.md` và ADR-001/002. Danh mục chi tiết các trang giao diện frontend nằm tại [FRONTEND_PAGE_CATALOG.md](FRONTEND_PAGE_CATALOG.md). Master doc yêu cầu đọc toàn bộ tài liệu và mô tả phase Kafka; quy tắc điều hướng mới nằm ở AGENTS/routing, còn trạng thái đã implement phải xác minh bằng source. Xem [bảng mâu thuẫn](roadmap/current-state-and-gaps.md).
