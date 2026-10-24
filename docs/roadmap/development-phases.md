# Các phase phát triển đề xuất

Đây là **ĐỀ XUẤT**, chưa phải kế hoạch đã quyết định, không đặt deadline. Ưu tiên theo giá trị và rủi ro dữ liệu EventHub, không theo độ phổ biến công nghệ. P0: ảnh hưởng tiền/chỗ/quyền vào cửa; P1: luồng cốt lõi và hợp đồng; P2: vận hành/hiệu năng có đo; P3: mở rộng sản phẩm sau nền tảng.

## Phase1 — Chốt invariant tồn kho và trạng thái (P0)

- **Mục tiêu/vấn đề:** thống nhất soldQuantity trộn pending/paid, ngăn release hai lần và confirm-vs-expire/cancel. Hiện TicketType có atomic reserve nhưng Booking không atomic transition.
- **Giá trị:** không bán quyền vào cửa cho chỗ đã trả lại, không làm lệch capacity/doanh thu.
- **Phạm vi:** chọn semantics counter; kiểm kê dữ liệu cũ; quyết định lock/version/conditional transition cho Booking; kiểm flush/bulk context; timeout/late payment policy.
- **Dependencies:** hiểu ADR-002/003, có PostgreSQL thử cô lập; không bắt đầu bằng migration mù.
- **Nghiệm thu:** mỗi pending chỉ reserve/release một lần; terminal state nhất quán; xác nhận không double-count; lỗi item sau rollback mọi reserve trước; có quy tắc tuổi booking rõ.
- **Kiểm chứng:** integration test hai transaction thật, confirm/cancel/expiry pairwise, DB invariant sau từng case; đối chiếu snapshot tiền.
- **Rủi ro/trade-off:** lock có chờ/deadlock, version cần retry, đổi counter cần chuyển dữ liệu; ưu tiên tính đúng hơn thêm hạ tầng.
- **Điều kiện qua phase2:** invariant được viết và tái hiện trên PostgreSQL, lỗi race đã có test regression, dữ liệu legacy có phương án an toàn.

## Phase2 — Payment/ticket đúng khi retry và quét đồng thời (P0)

- **Mục tiêu/vấn đề:** unique reference chưa đủ cho hai confirm; check-in read→write chưa bảo vệ đúng một lượt vào cửa; issuance trả partial list hiện có.
- **Giá trị:** khách trả tiền nhận đủ vé, không phát quyền trùng và không vào cửa hai lần.
- **Phạm vi:** atomic confirm theo Booking; xử lý unique collision hợp đồng; issuance reconciliation; atomic check-in; policy event cancellation/ticket cancellation trước refund.
- **Dependencies:** phase1 chốt pending/terminal và reservation; phase API error contract phối hợp khi xử lý conflict.
- **Nghiệm thu:** retry cùng reference cùng booking không lặp tác động; khác booking bị từ chối; hai reference không tạo hai thành công cho cùng đơn; phát đủ vé; hai cổng chỉ một success.
- **Kiểm chứng:** PostgreSQL concurrency và transaction rollback issuance; HTTP assertions cho retry/error; số vé đúng tổng quantity.
- **Rủi ro/trade-off:** đổi response conflict ảnh hưởng client; deterministic ticketCode cần threat model, không thay vội khi dữ liệu đã cấp.
- **Điều kiện qua phase3:** có test đúng một tác động và đối soát thiếu vé/paid booking; chưa đưa provider thật trước invariant này.

## Phase3 — Chuẩn hóa API, quyền và constraint (P1)

- **Mục tiêu/vấn đề:** PATCH category/blank chưa rõ, TicketType GET visibility khác Event, malformed/DB errors chưa thống nhất; entity nullable nhiều field.
- **Giá trị:** client hiểu contract, người dùng không thấy dữ liệu ngoài ý định, lỗi dễ debug.
- **Phạm vi:** chốt absent/null/blank PATCH, paging/sort whitelist, error envelope, role/ownership matrix; migration versioned cho constraints cần thiết; email/name normalization; CORS/session policy/rate limit theo threat model.
- **Dependencies:** phases1–2 thống nhất trạng thái và concurrency; audit dữ liệu trước NOT NULL/UNIQUE/CHECK.
- **Nghiệm thu:** catalog khớp HTTP test, không thay contract âm thầm; status/error rõ với input sai; constraint bảo vệ invariant đã chọn; security tests gồm token invalid/status/ownership.
- **Kiểm chứng:** MockMvc/HTTP integration, DB constraint tests và migration trên bản dữ liệu thử; không dùng H2 làm chứng cứ duy nhất cho PostgreSQL.
- **Rủi ro/trade-off:** client compatibility, dữ liệu trùng/null cũ; constraint thêm sau cleanup có kiểm chứng.
- **Điều kiện qua phase4:** API/security/schema có acceptance rõ, test tự động và migration lặp được.

## Phase4 — Hoàn thiện waitlist trong runtime (P1)

- **Mục tiêu/vấn đề:** service cấp offer chưa nối release; fairness/hold chưa chốt; accept expiry rollback và double accept chưa được kiểm chứng.
- **Giá trị:** vé trở lại đến đúng người chờ, giảm mất cơ hội và tránh lời mời hứa quá mức.
- **Phạm vi:** chốt FIFO eligible/strict policy và starvation; reserve offer hay không; trigger cấp offer; atomic entry/offer transition; chống active duplicate; contract notification nếu cần.
- **Dependencies:** phase1 inventory và phase3 constraint/contract.
- **Nghiệm thu:** có runtime flow release→selection→offer; không cấp trùng/convert hai lần; expiry commit đúng; khách hiểu offer có bảo đảm chỗ hay không.
- **Kiểm chứng:** scenario join sold-out→cancel/expire release→offer→accept→booking; cạnh tranh nhiều workers và time boundary thật.
- **Rủi ro/trade-off:** reserve offer cần thêm release/transfer rule; strict FIFO có thể bỏ trống vé; chưa cần broker nếu gọi nội bộ đủ.
- **Điều kiện qua phase5:** toàn luồng chạy bằng test tích hợp, metric nghiệp vụ xác định; không chỉ có test service mock.

## Phase5 — Thanh toán thực và vận hành có kiểm chứng (P1/P2)

- **Mục tiêu/vấn đề:** hiện confirm thủ công, chưa deploy/CI/migration/observability production.
- **Giá trị:** đối soát tiền đáng tin và biết hệ thống lỗi ở đâu.
- **Phạm vi:** chọn provider theo nhu cầu thực; checkout/webhook signature/amount/currency/status/replay; secrets; backup/restore; CI test; đóng gói deploy; health/security; log correlation không lộ token; scheduler nhiều instance nếu cần.
- **Dependencies:** tính đúng phases1–3; provider sandbox được cấp riêng, không dùng dữ liệu/tiền thật khi thử.
- **Nghiệm thu:** forged/duplicate/late callbacks có behavior rõ; deploy môi trường thử lặp được; rollback/restore diễn tập; alert cho paid-no-ticket và pending quá tuổi có chủ trách nhiệm.
- **Kiểm chứng:** provider sandbox contract tests, CI chạy unit+PostgreSQL suite, deployment smoke và restore drill.
- **Rủi ro/trade-off:** side effect ngoài DB không rollback cùng JPA; outbox/queue chỉ khi yêu cầu delivery/retry cụ thể.
- **Điều kiện qua phase6:** luồng tiền/vé đối soát được, vận hành đo được và có baseline tải.

## Phase6 — Hiệu năng và discovery (P2/P3)

- **Mục tiêu/vấn đề:** chưa có query/load measurement; EventMatch mới là định hướng ADR-001.
- **Giá trị:** giảm thời gian tìm event và xử lý nhiều người mua mà giữ correctness.
- **Phạm vi:** đo SQL/N+1/EXPLAIN/latency; index/projection theo workload; deterministic search/ranking trước AI; nếu EventMatch cần LLM thì validate structured output và chỉ trả event thật.
- **Dependencies:** schema/query/observability ổn, có tiêu chí sản phẩm và tập đánh giá.
- **Nghiệm thu:** baseline và mục tiêu đo được do nhóm quyết định; kết quả discovery chỉ gồm event hợp lệ; không degrade invariant/test tiền/vé.
- **Kiểm chứng:** benchmark dữ liệu thử đại diện, query count, ranking evaluation và regression test filter quyền/status.
- **Rủi ro/trade-off:** caching gây stale inventory; vector search/Redis/Kafka/microservices tăng chi phí và chỉ xét khi giải quyết bottleneck chứng minh được.
- **Điều kiện kết thúc:** lợi ích đo được, docs/ADR cập nhật và có cách vận hành/rollback.
