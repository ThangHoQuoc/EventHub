# Hướng dẫn làm việc với EventHub

## Dự án và căn cứ

- EventHub là hệ thống quản lý sự kiện, đặt vé, xác nhận thanh toán và check-in.
- Backend: `backend/`, package `com.eventhub.eventhub_backend`.
- Đã xác minh từ POM: Java 21, Spring Boot 3.5.0, Maven, Spring MVC,
  Spring Security, JPA/Hibernate, PostgreSQL, MapStruct 1.6.3, Lombok,
  JJWT 0.12.6, Bean Validation, Actuator; test dùng JUnit/Mockito/H2.
- Frontend: `frontend/`, React/TypeScript/Vite; giáo trình hiện tập trung backend.
- Bắt đầu ở [chỉ mục docs](docs/README.md) hoặc
  [module index](docs/architecture/module-index.md) khi chưa biết nơi sửa.
- Source working tree là căn cứ xác minh hiện trạng; docs có thể lỗi thời.
- Không coi mục tiêu trong product requirements/master doc là tính năng đã có.

## Trước khi làm

- Đọc `git status --short`; giữ nguyên công việc chưa commit của người dùng.
- Kiểm tra hướng dẫn lồng trong thư mục sắp sửa nếu có.
- Đọc file cần sửa, interface/DTO/entity liên quan và test đại diện.
- Chọn tài liệu theo task ở bảng dưới; không đọc toàn bộ docs mỗi phiên.
- Khi source mâu thuẫn docs, chỉ rõ mâu thuẫn và cập nhật phần liên quan.
- Ghi nhãn ĐÃ XÁC MINH, SUY LUẬN, KHOẢNG THIẾU, ĐỀ XUẤT khi cần.
- Không khẳng định lý do lịch sử nếu không có ADR hay bằng chứng.

## Thứ tự ưu tiên và xác minh hiện trạng
- AGENTS.md là hướng dẫn làm việc và bản đồ điều hướng, không phải nguồn xác minh cuối cùng về hành vi ứng dụng.
- Khi xác minh hành vi hiện tại, ưu tiên source code, cấu hình thực tế và test liên quan. Kiểm tra runtime hoặc database khi cần xác minh hành vi thực tế.
- Tài liệu domain, API, architecture và ADR cung cấp ngữ cảnh, quy tắc đã ghi nhận và lịch sử quyết định. Đối chiếu với implementation khi task có liên quan.
- Những thông tin hiện trạng ghi trực tiếp trong AGENTS.md có thể lỗi thời. Khi task liên quan đến chúng, hãy xác minh lại trước khi sử dụng.
- Nếu phát hiện tài liệu sai hoặc mâu thuẫn với source, hãy xác định phạm vi ảnh hưởng, cập nhật tài liệu liên quan nếu được phép và báo cáo những điểm chưa thể xác minh.
- Không sửa source code chỉ để làm cho implementation khớp với tài liệu.
- Chỉ đọc tài liệu và source cần thiết cho task. Mở rộng phạm vi đọc khi có mâu thuẫn, dependency chưa rõ hoặc cần truy vết luồng end-to-end.
- Không đọc toàn bộ docs/ theo mặc định. Sử dụng mục Điều hướng theo task và docs/ai/documentation-routing.md để chọn tài liệu liên quan.
- Trước khi sửa một module, đọc hướng dẫn áp dụng trong thư mục đó nếu có, cùng interface, DTO, entity, implementation và test liên quan.
- Khi giải thích hành vi, phân biệt rõ ĐÃ XÁC MINH, SUY LUẬN, KHOẢNG THIẾU và ĐỀ XUẤT khi cần.
- Không khẳng định lý do lịch sử hoặc mục đích của một quyết định nếu không có bằng chứng trong ADR, tài liệu hoặc lịch sử thay đổi phù hợp.

## Điều hướng theo task

| Task | Đọc trước | Sau đó |
|---|---|---|
| API | [catalog](docs/api/endpoint-catalog.md) | Controller, DTO, service và guide module |
| Database/JPA | [data](docs/data/database-design.md) | Entity, repository, transaction của luồng |
| Xác thực/quyền | [security](docs/security/security-model.md) | SecurityConfig, JWT filter, ownership trong service |
| Nghiệp vụ | [domain](docs/domain/domain-overview.md) | Business rules và lifecycle |
| Kiến trúc | [overview](docs/architecture/architecture-overview.md) | ADR liên quan trong `docs/decisions/` |
| Test/debug | [lệnh và test](docs/development/commands-and-testing.md) | Test module và breakpoint trong guide |
| Học tập | [lộ trình học](docs/learning/learning-path.md) | Guide tương ứng trong `docs/learning/modules/` |
| Việc dang dở | [handoff](docs/ai/handoff.md) | Xác minh lại Git/source/test hiện tại |

Chi tiết: [documentation routing](docs/ai/documentation-routing.md).

## Phạm vi chỉnh sửa

- Với nhiệm vụ tài liệu: chỉ sửa Markdown và tài sản phục vụ docs.
- Không sửa source, test, migration, build, dependency, cấu hình chạy để khớp docs.
- Với nhiệm vụ code sau này: chỉ sửa phạm vi người dùng đã yêu cầu.
- Không reset/clean/checkout hay ghi đè thay đổi chưa commit.
- Không tạo commit, push, deploy hoặc gọi hệ thống ngoài nếu không được giao.
- Không cài dependency chỉ để tạo sơ đồ; dùng bộ render SVG có sẵn trong docs.
- Bảo toàn tài liệu lịch sử; ADR mới giải thích thay đổi thay vì xóa ADR cũ.
- Mọi giải thích mới bằng tiếng Việt; giữ identifier code bằng tiếng Anh.

## Lệnh và điều kiện dùng
Backend

- Chạy lệnh backend từ thư mục backend/. Sử dụng JDK 21 theo cấu hình dự án.

- Trước khi chạy, kiểm tra môi trường:

java -version
mvn -version

- Nếu máy đang sử dụng Java khác phiên bản yêu cầu, thiết lập JAVA_HOME phù hợp cho phiên shell hiện tại.

- Các lệnh thường dùng:

.\mvnw.cmd test
.\mvnw.cmd -Dtest=BookingServiceImplTest test
.\mvnw.cmd package
.\mvnw.cmd spring-boot:run

- Điều kiện và lưu ý:

- Maven Wrapper có trong repository; xác minh cấu hình wrapper khi cần biết phiên bản Maven.
- Có thể sử dụng Maven cài sẵn nếu phiên bản và môi trường phù hợp.
- Có thể dùng mvn -o test -B khi dependency cần thiết đã có trong cache. Nếu không, chế độ offline có thể thất bại do thiếu dependency.
- Xác minh cấu hình test trong src/test/resources/application.properties trước khi kết luận test sử dụng H2 hoặc một cấu hình cụ thể.
- Nếu test khởi tạo Spring cần JWT_SECRET, sử dụng giá trị giả phù hợp trong môi trường test. Không ghi secret thật vào tài liệu, source hoặc log.
spring-boot:run cần các dịch vụ và biến môi trường bắt buộc đã được cấu hình, bao gồm PostgreSQL và JWT secret nếu implementation yêu cầu.
package có thể chạy test theo cấu hình Maven hiện tại. Kiểm tra kết quả thực tế trước khi báo cáo.
-DskipTests không chứng minh test đã thành công.
- Chỉ chạy lệnh cần thiết cho task. Không mặc định chạy toàn bộ build khi chỉ sửa tài liệu.
- Docker Compose
- Xác minh vị trí file Compose và tên service trước khi chạy lệnh.
- Chỉ chạy từ thư mục chứa file Compose phù hợp hoặc chỉ định đúng file bằng tùy chọn -f.
- Trong cấu hình đã khảo sát, Compose dùng để chạy PostgreSQL; không mặc định backend cũng chạy trong container.

- Ví dụ, nếu file Compose và service vẫn đúng như hiện trạng:

docker compose up -d postgres
- Nguyên tắc xác minh và báo cáo
- Chỉ báo test hoặc lệnh đã thành công khi đã chạy và quan sát kết quả thực tế.
- Nếu không chạy được do môi trường, nêu rõ nguyên nhân và phạm vi chưa được xác minh.
- Phân biệt rõ đã đọc source, đã chạy test và đã xác minh hành vi runtime; đây là các mức bằng chứng khác nhau.
- Không chạy lệnh phá hủy dữ liệu, reset môi trường, ghi đè thay đổi hoặc gọi hệ thống ngoài phạm vi được giao.
- Kết quả xác minh đã ghi nhận trước đó nằm trong docs/project/verification.md; kiểm tra lại nếu cần dựa vào trạng thái hiện tại.

## Quy tắc dữ liệu và quyền

- Đăng ký luôn tạo CUSTOMER/ACTIVE; không nhận role từ client.
- Role chưa đủ: kiểm tra quyền sở hữu Event, Booking, Ticket, WaitlistOffer.
- `ticket` là loại vé; `ticketing` là vé đã phát hành, không gộp hai khái niệm.
- Trong working tree khảo sát, `soldQuantity` tăng khi tạo booking để giữ chỗ.
- Khả dụng hiện là `quantity - soldQuantity`; chưa có `reservedQuantity`.
- Payment confirmation không tăng tồn kho lần nữa; xem ADR-003.
- Không cho rằng `@Transactional` tự ngăn mọi race condition.
- Không cho rằng retry tuần tự chứng minh idempotency đồng thời.
- Không ghi password, JWT, API key, secret, dữ liệu tài khoản thật vào docs.
- Chỉ nêu tên biến môi trường và ví dụ dữ liệu giả được đánh dấu.
- Không kết luận JWT bảo đảm an toàn hoặc filter chain đã stateless.
- JPA annotation là schema dự kiến; chưa xác minh constraint trên DB thật.

## Cập nhật tài liệu và bàn giao

- API đổi: cập nhật catalog, DTO contract và guide module.
- Entity/query đổi: cập nhật data docs, ER và invariant liên quan.
- Lifecycle/quyền đổi: cập nhật domain/security, test coverage và hình.
- Quyết định khó đảo ngược: thêm ADR với trạng thái và trade-off.
- Giữ source sơ đồ và SVG đồng bộ; hướng dẫn ở `docs/assets/diagrams/README.md`.
- Kiểm tra link tương đối, đường dẫn source và identifier trước khi bàn giao.
- Chỉ báo test đã chạy nếu có kết quả thật; nêu hạn chế môi trường.
- Handoff ghi mục tiêu, file, kết quả, việc còn lại và giới hạn xác minh.
- Không đưa toàn bộ giáo trình hoặc danh sách class vào file này.
- Giữ lớp hướng dẫn AI ngắn; phần giải thích sâu nằm trong giáo trình.
