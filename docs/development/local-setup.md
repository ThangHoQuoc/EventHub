# Chạy backend ở local

## Điều kiện đã xác minh

POM yêu cầu Java 21, Spring Boot 3.5.0. Có Maven wrapper 3.9.16. Compose dùng PostgreSQL 17 và persistent volume. Main datasource trỏ localhost:5433/eventhub; Compose ánh xạ cổng host 5433 sang cổng PostgreSQL 5432 trong container. JWT secret lấy từ biến `JWT_SECRET`; expiration mặc định 3600000 mili giây. Không đưa giá trị credentials cấu hình vào tài liệu.

Máy khảo sát có JDK 21 ở `C:\Program Files\Java\jdk-21.0.10`, nhưng Java mặc định và JAVA_HOME là Java 8. Trong PowerShell, đặt tạm cho phiên làm việc:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.10'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
mvn -version
Set-Location backend
```

Trên máy khác thay đường dẫn JDK theo cài đặt thực tế, không sao chép đường dẫn máy khảo sát như một yêu cầu sản phẩm.

## PostgreSQL và ứng dụng

Từ `backend/`, lệnh dự kiến theo Compose/POM:

```powershell
docker compose up -d postgres
.\mvnw.cmd spring-boot:run
```

Chuẩn bị `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` và `JWT_SECRET` ngoài Git theo môi trường thử. Secret HMAC phải đủ mạnh/độ dài cho thuật toán được JJWT chọn. Không dùng ví dụ chuỗi ngắn trong docs làm secret thật. Compose hiện có credentials local hardcoded; đọc tại máy và quản lý phù hợp, không sao chép vào tài liệu.

Server dùng cổng Boot mặc định nếu không override; chưa gọi HTTP để kiểm tra bind port trong nhiệm vụ này. Không có cấu hình CORS được xác minh, nên lỗi frontend preflight cần kiểm tra thêm, không tự sửa backend khi chỉ viết docs.

## Chạy test cô lập

Test resource override datasource sang H2 memory và ddl-auto=create-drop. Spring context test cần JWT_SECRET. Có thể tạo secret ngẫu nhiên chỉ trong phiên shell:

```powershell
$env:JWT_SECRET=[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
mvn -o test -B
```

Không in biến secret. Offline chỉ dùng được khi dependency đã nằm trong Maven cache; nếu cache thiếu, lệnh thất bại, không tự cài thêm dependency để phục vụ docs. [Kết quả thực tế](../project/verification.md) ghi lượt test đã chạy.

## Debug lỗi khởi động

Unsupported class version/release: kiểm tra Java mà Maven thực dùng. Connection refused: kiểm tra PostgreSQL/container/port trước khi nghĩ lỗi JPA. JWT placeholder/signing key: kiểm tra tên biến và độ dài, không log giá trị. Table/column khác dự kiến: xem ddl-auto và schema thật; không reset volume để “sửa nhanh”.
