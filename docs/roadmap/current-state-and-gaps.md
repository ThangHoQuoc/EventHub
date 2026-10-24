# Hiện trạng, mâu thuẫn và khoảng thiếu

Cập nhật ngày 19/10/2026: **123 tests pass**, gồm 40 integration test trên PostgreSQL 17 thử nghiệm cô lập và 83 test unit/H2 có sẵn. Chưa kiểm HTTP server hoặc database production; xem [biên bản concurrency](../project/concurrency-verification.md).

## Mức hoàn thiện

| Nhóm | Đã implement trong source | Một phần/chưa đủ bằng chứng |
|---|---|---|
| Auth/user | Register/login JWT, BCrypt, ACTIVE, current user | Refresh/revoke/logout, CORS/stateless explicit, HTTP chain coverage |
| Event/search | DRAFT/publish/cancel/complete, ownership, Criteria filters | Moderation/approval, query integration, PATCH blank/category contract |
| TicketType | CRUD draft, giá/capacity/available | DB constraint tên/counter/null, visibility GET |
| Booking | Snapshot giá, gộp item, atomic reserve, khóa transition cancel/expire | Counter semantics, tải và deadlock ngoài các lịch đã test |
| Payment | ADMIN confirm, khóa Booking/replay, SUCCESS/issue | Provider checkout/webhook/signature, refund, collision cùng key khác booking |
| Ticketing | Một vé mỗi quantity, code/payload, ownership/check-in có khóa Ticket | partial issuance reconciliation, signed/random credential |
| Waitlist | Join/cấp offer có khóa, listener sau commit, job phục hồi, accept/skip/expiry an toàn | Offer chưa reserve; tải, SQL ghi trực tiếp và notification Phase 9 |
| Vận hành | Compose DB, scheduler, Actuator dependency | Production deploy/CI/migration/metrics/alerting, nhiều instance |
| AI/infrastructure | Search thường và định hướng ADR | Không thấy EventMatch/LLM, Redis, Kafka/email implementation |

## Tài liệu cũ mâu thuẫn implementation

| Tài liệu cũ | Nội dung | Bằng chứng source hiện tại / cách đọc |
|---|---|---|
| EVENTHUB_PROJECT_MASTER_DOC.md | Phase9 Notification/Kafka, danh sách hướng phát triển và “source of truth” | POM/source không có Kafka/Redis/LLM; lấy source làm hiện trạng, giữ master như lịch sử/mục tiêu |
| ADR-002 | Pending không reserve, soldQuantity chỉ bán xác nhận, payment tăng counter | createBooking reserve + cancel/expire release; payment không tăng; [ADR-003](../decisions/ADR-003-current-inventory-semantics.md) ghi khác biệt chưa commit |
| ADR-001 | Waitlist entities và EventMatch được dự kiến | Waitlist entity/service đã có một phần; EventMatch chưa có source backend |
| backend/HELP.md | Link Boot4.1.1 | POM dùng Boot3.5.0; tham khảo đúng phiên bản khi triển khai |
| Quy tắc đọc toàn master trước task | Dễ nạp nhiều context không liên quan | AGENTS/routing mới chọn tài liệu theo task, xác minh source |

## Rủi ro ưu tiên theo chứng cứ

**ĐÃ TÁI HIỆN VÀ SỬA:** 9 lịch tranh chấp cancel/expire/confirm/check-in thất bại trước sửa, thành công sau khi khóa Booking/Ticket. Suite mở rộng 14 test kiểm cả hai chiều cancel–expiry, batch, hai booking chung loại vé và rollback phát hành. **CÒN LẠI:** policy late payment, provider/HTTP contract và các đường chưa được test; không suy ra toàn hệ thống đã hết race.

**ĐÃ XÁC MINH về cấu trúc:** Phase 8 đã bảo vệ active entry/offer bằng khóa TicketType và commit nhánh accept hết hạn; 26 test PostgreSQL bổ sung kiểm chứng runtime. Chưa có unique active constraint cho SQL ngoài service; offer không reserve; convertedBookingId không FK; TicketType còn thiếu constraint dữ liệu; bulk reserve chưa clear context; lỗi malformed input/DB collision còn cần chuẩn hóa. Xem [biên bản Phase 8](../project/phase-8-verification.md).

**Chưa thể xác minh:** schema/index thực PostgreSQL, dữ liệu lịch sử counter, workload/N+1 thực đo, contract frontend thực tế, deployment topology, tiền thực/provider và lý do ban đầu ngoài ADR đã có. Không truy cập dữ liệu thật để lấp khoảng thiếu.
