# Lệnh, test và giới hạn bằng chứng

Chạy từ `backend/`, JDK 21 và JWT_SECRET tạm cho test context. Lệnh Maven CLI và wrapper tương đương về goal; wrapper có thể tải Maven nếu chưa có cache.

| Lệnh | Khi dùng | Trạng thái xác minh trong nhiệm vụ |
|---|---|---|
| `mvn -o test -B` | Test toàn bộ bằng dependency cache | Đã chạy: 83 tests, 0 failure/error/skipped |
| `.\mvnw.cmd test` | Test bằng wrapper | Wrapper/config có thật, chưa chạy riêng |
| `mvn '-Dtest=BookingServiceImplTest' test` | Vòng lặp phát triển module | Cú pháp hướng dẫn, chưa chạy riêng |
| `.\mvnw.cmd package` | Tạo jar và chạy test theo lifecycle | Plugin có thật, chưa chạy package |
| `.\mvnw.cmd spring-boot:run` | Chạy local với PostgreSQL | Chưa chạy server |
| `docker compose up -d postgres` | Bật DB local | Chưa chạy Compose |
| `git status --short`, `git diff --check` | Kiểm tra phạm vi/diff | Đã kiểm tra, xem biên bản cuối |
| `python docs/assets/diagrams/sources/render.py` | Render lại SVG từ gốc repo | Chỉ thư viện chuẩn, chỉ ghi assets docs |

## Test hiện có

| Nhóm | Số ca đã chạy | Loại/phạm vi |
|---|---:|---|
| AuthServiceImplTest / JwtAuthenticationFilterTest | 3 + 3 | Mockito/unit; ACTIVE/INACTIVE/BANNED |
| BookingServiceImplTest | 12 | Unit service, reserve/release/expire qua mock |
| EventServiceImplTest / EventMapperTest | 15 + 3 | Unit nghiệp vụ và MapStruct |
| PaymentServiceImplTest | 4 | Confirm/replay/status, mock TicketService |
| TicketTypeServiceImplTest | 10 | CRUD draft, ownership, quantity/name |
| TicketServiceImplTest | 9 | Phát vé, replay tuần tự, quyền và check-in |
| WaitlistServiceImplTest / WaitlistOfferServiceImplTest | 5 + 15 | Join, offer, accept/skip/expire/chọn entry |
| UserRepositoryTest / UserMapperTest / PasswordEncoderTest | 1 + 1 + 1 | Spring/H2 repository; mapper; BCrypt trực tiếp |
| EventhubBackendApplicationTests | 1 | Spring context/H2 khởi tạo |

Tổng 83 ca trong 14 test class. “Unit” là kiểm tra thành phần cô lập; “integration” ghép Spring/JPA/DB thử. H2 không thay PostgreSQL để xác minh lock, isolation, index hoặc SQL dialect. Không có HTTP MockMvc/end-to-end suite được xác minh trong source test.

## Cách debug theo tầng

401 trước controller: kiểm tra Bearer prefix, JWT validation, User status, entry point. 403: kiểm tra authority rồi ownership. 400 validation: xem field map trước service. 400 domain: breakpoint chỗ throw AppException, ghi input giả và state. Lỗi persistence: xem transaction active, SQL/row count, constraint và rollback. Tránh in password/token/QR của người thật.

## Test cần thêm (đề xuất, chưa viết)

PostgreSQL hai transaction cạnh tranh reserve; confirm vs cancel vs expiry; hai check-in; join/offer đồng thời; accept hết hạn với transaction thật; malformed JSON/bind/sort/constraint collision ở HTTP. Mỗi test cần assertion trạng thái DB cuối cùng và số tác động, không chỉ verify(mock.save).
