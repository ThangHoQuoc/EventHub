# Điều hướng tài liệu theo task

Đây là lớp A ngắn cho AI. Không dùng nó thay giáo trình hoặc source. Đọc AGENTS, trạng thái Git, rồi chọn **một hàng** phù hợp; mở source và test đúng module. Chỉ mở rộng phạm vi khi gặp phụ thuộc, mâu thuẫn hoặc khoảng thiếu cụ thể.

| Task | Tài liệu ưu tiên | Source cần mở tiếp |
|---|---|---|
| Thêm/sửa API | endpoint-catalog, dto-contracts, conventions | Controller/DTO/service và test module |
| Entity/query/JPA | database-design, entity-relationships, transaction-and-data-integrity | Entity, repository, transaction caller; kiểm migration nếu có mới |
| Login/JWT/role | security-model, guide auth/user | SecurityConfig, JwtAuthenticationFilter, AuthServiceImpl, CurrentUserService |
| Ownership | business-rules + guide tài nguyên | Guard trong service; không chỉ @PreAuthorize |
| Tồn kho/booking/payment | ADR-003, transaction docs, guide booking/payment | Working tree BookingServiceImpl, TicketTypeRepository, PaymentServiceImpl, tests |
| Waitlist | guide waitlist, current-state-and-gaps | Entry/Offer services/repos và caller runtime nếu đã thêm |
| Kiến trúc | architecture-overview, module-index, ADR liên quan | Dependency thật giữa bean/repository/entity |
| Test/debug | commands-and-testing, guide module | Test hiện có và nhánh failure tương ứng |
| Học | learning-path, một guide module | Theo bảng thứ tự trong guide, không quét cả repo |
| Tiếp tục việc cũ | handoff + git status | File đã ghi trong handoff và thay đổi từ lúc ghi |

Các tên tài liệu tra qua [docs index](../README.md), [module index](../architecture/module-index.md) và [checklist học](../learning/modules/README.md). Điều hướng này không yêu cầu đọc tất cả tài liệu ở mọi phiên.

## Ngân sách context thực dụng

Nạp contract + source/test của use case trước. Không nạp toàn bộ master doc/DTO/entity nếu chỉ sửa một field. Khi cần phần nền sâu, liên kết tới guide tương ứng thay vì sao chép vào handoff. Đối chiếu method/entity/API hiện tại trước khi tin ngày khảo sát 09/10/2026.

## Quy tắc chống tài liệu lỗi thời

Source/test/config quyết định hiện trạng; roadmap/ADR đề xuất không chứng minh implementation. Nếu docs và source khác, ghi chỗ khác và nhãn độ tin cậy, không chỉnh code chỉ để khớp docs. Khi implementation đổi, cập nhật catalog/data/domain/security/guide/hình liên quan và handoff. Giữ phần đã xác minh tách khỏi suy luận.
