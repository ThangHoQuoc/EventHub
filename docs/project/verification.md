# Biên bản kiểm chứng và danh sách bàn giao

Ngày 09/10/2026. Tài liệu lấy working tree tại HEAD `8f258e2d7c4397200e9273f1ec0f7336e6559b9a` làm snapshot; các thay đổi có sẵn chưa commit được giữ nguyên.

## Kết quả đã thực hiện

| Kiểm tra | Kết quả thực tế | Giới hạn |
|---|---|---|
| Git status trước/sau | Đã đọc, không checkout/reset/clean/commit | Working tree vốn đã có sửa source/test và frontend |
| SHA-256 file có sẵn | Chỉ README.md thay đổi; file ứng dụng/test/config/build và docs cũ không đổi so baseline | Baseline gồm file project, bỏ .git/node_modules/target/.idea/dist/.next; artifact build ignored không so |
| Phạm vi file | 62 file mới và 1 file cập nhật, chỉ Markdown/assets docs | 46 Markdown được tạo/cập nhật, 15 SVG + JSON + bộ render Python |
| Lệnh test | `mvn -o test -B`, JDK21, JWT secret ngẫu nhiên tạm, H2 test config | Chạy Maven cài sẵn; không tải dependency; không kiểm wrapper riêng |
| Surefire | **83 tests, 14 class; 0 failures, 0 errors, 0 skipped; BUILD SUCCESS** | Unit mocks + Spring/H2, không chứng minh PostgreSQL concurrency hay HTTP end-to-end |
| Catalog API | Trích mapping controller và so tập method/path: **31/31**, không thiếu/thừa | Chưa gọi endpoint runtime; không kiểm implicit endpoint framework |
| DTO/entity | 24 DTO được trích trường/annotation; 9 entity + BaseEntity được đối chiếu | Tên Java không tự là physical column name; chưa đọc DB schema thật |
| Liên kết | Kiểm tra đường dẫn local trong toàn bộ Markdown mới/cập nhật, không còn link thiếu | Không xác nhận trạng thái nội dung mọi URL web/tài liệu lịch sử |
| Sơ đồ | 15 SVG parse XML đúng, nằm trong canvas, khớp render lại từ JSON | Kiểm source/render, không coi hình là test behavior runtime |
| Xem hình | Chrome headless mở SVG thành 3 gallery, đã xem đủ 15 hình | Ảnh kiểm tra nằm thư mục tạm, không thêm dependency |
| AGENTS | 100 dòng, có routing và giới hạn task | Không yêu cầu nạp toàn bộ docs |
| Whitespace | `git diff --check` không báo lỗi whitespace | Git có cảnh báo LF→CRLF theo cấu hình, không chỉnh cấu hình đó |
| Dữ liệu nhạy cảm | Không sao chép credentials cấu hình/token thật; rà mẫu JWT trong docs mới không thấy | Không phải kiểm toán secret toàn repository |

Lượt gọi Maven đầu có tham số `-Dstyle.color=never` bị PowerShell phân tích sai nên không chạy test; đã bỏ tham số và chạy lại thành công. Không dùng lượt thất bại đó làm chứng cứ test. Shell sandbox lúc đầu lỗi khởi tạo; các thao tác đọc/test cần shell được chạy qua cơ chế escalation đã được chấp thuận, còn sửa tài liệu dùng apply_patch hoặc ghi riêng trong docs.

## Chưa kiểm chứng

Không khởi động server chính/Compose; không truy cập PostgreSQL hoặc dữ liệu thật; không đo SQL count/EXPLAIN/tải; không kiểm provider/tiền thực; không chạy deployment/frontend/HTTP suite. Các race condition và rollback expiry được phân tích từ source, chưa được tái hiện bằng integration test mới. Không sửa application code hay test để hoàn thiện những khoảng thiếu đó.

## Danh sách file tạo/cập nhật

**Cập nhật:** [README gốc](../../README.md), trước đó rỗng.

**Tạo hướng dẫn/điều hướng:** [AGENTS](../../AGENTS.md), [docs index](../README.md), [routing](../ai/documentation-routing.md), [handoff](../ai/handoff.md).

**Project:** [overview](project-overview.md), [scope/use cases](scope-and-use-cases.md), [glossary](glossary.md), [survey](survey.md), biên bản này.

**Domain:** [overview](../domain/domain-overview.md), [business rules](../domain/business-rules.md), [lifecycle](../domain/lifecycle-and-state-transitions.md).

**Architecture/ADR:** [context](../architecture/system-context.md), [overview](../architecture/architecture-overview.md), [module index](../architecture/module-index.md), [flows](../architecture/major-flows.md), [ADR-003](../decisions/ADR-003-current-inventory-semantics.md), [ADR-004](../decisions/ADR-004-layered-backend.md).

**API:** [overview](../api/api-overview.md), [catalog](../api/endpoint-catalog.md), [DTO contracts](../api/dto-contracts.md), [conventions/errors](../api/conventions-and-error-handling.md).

**Data/security:** [database](../data/database-design.md), [entity inventory](../data/entity-inventory.md), [ER](../data/entity-relationships.md), [transaction](../data/transaction-and-data-integrity.md), [security model](../security/security-model.md).

**Development/roadmap:** [local](../development/local-setup.md), [commands/tests](../development/commands-and-testing.md), [operations](../development/deployment-and-operations.md), [current state](../roadmap/current-state-and-gaps.md), [phases](../roadmap/development-phases.md).

**Learning:** [index](../learning/README.md), [path](../learning/learning-path.md), [module checklist](../learning/modules/README.md), [auth](../learning/modules/auth.md), [user](../learning/modules/user.md), [event](../learning/modules/event.md), [ticket](../learning/modules/ticket.md), [booking](../learning/modules/booking.md), [payment](../learning/modules/payment.md), [ticketing](../learning/modules/ticketing.md), [waitlist](../learning/modules/waitlist.md), [common/config](../learning/modules/common-config.md).

**Assets:** [hướng dẫn và danh sách 15 SVG](../assets/diagrams/README.md), [JSON source](../assets/diagrams/sources/diagrams.json), [render.py](../assets/diagrams/sources/render.py). SVG được chèn trực tiếp ở các tài liệu tham chiếu và từng bài học như bảng trong asset index.

Tài liệu cũ giữ nguyên. Đọc tiếp theo [lộ trình học](../learning/learning-path.md); phát triển tiếp ưu tiên phase1/2 về tồn kho, Booking transition và quyền vào cửa trước thêm provider/AI/infrastructure.
