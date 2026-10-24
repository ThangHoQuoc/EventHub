# Thuật ngữ

| Thuật ngữ | Ý nghĩa trong EventHub |
|---|---|
| Actor | Người hoặc tác vụ tự động tương tác với hệ thống |
| Organizer | User sở hữu Event; quyền từ role ORGANIZER và organizer_id |
| Event | Sự kiện có thời gian, địa điểm dạng chuỗi và trạng thái |
| TicketType | Loại vé có giá/sức chứa; khác vé cá nhân |
| Booking | Yêu cầu đặt một hoặc nhiều loại vé trong cùng event |
| BookingItem | Một dòng đặt vé, lưu số lượng và giá tại lúc đặt |
| Payment | Bản ghi xác nhận thanh toán, hiện do ADMIN xác nhận |
| Ticket | Vé đã phát hành cho một người, có ticketCode và qrPayload |
| WaitlistEntry | Nhu cầu mua khi loại vé hết khả dụng |
| WaitlistOffer | Lời mời có hạn, chưa giữ tồn kho riêng |
| Domain invariant | Quy tắc nghiệp vụ phải luôn đúng, ví dụ không bán vượt sức chứa |
| Authentication | Xác thực: xác định người gọi, ở đây qua JWT và User |
| Authorization | Phân quyền: kiểm tra role và quyền sở hữu tài nguyên |
| DTO | Đối tượng truyền dữ liệu API, giới hạn trường client được gửi/nhận |
| Entity | Đối tượng JPA ánh xạ dữ liệu lâu dài và quan hệ |
| Dependency Injection | Tiêm phụ thuộc: Spring cung cấp repository/service qua constructor |
| Transaction | Giao dịch cơ sở dữ liệu: nhóm thay đổi commit hoặc rollback cùng nhau |
| Persistence context | Vùng quản lý entity của JPA trong một đơn vị làm việc |
| Dirty checking | JPA phát hiện thay đổi entity được quản lý để ghi xuống DB khi flush |
| Flush | Đồng bộ thay đổi object xuống DB; chưa đồng nghĩa commit |
| Cascade | Truyền thao tác persistence qua quan hệ; không phải tự động bảo vệ nghiệp vụ |
| Concurrency | Xử lý đồng thời: hai request có thể đọc cùng trạng thái rồi cùng sửa |
| Race condition | Kết quả phụ thuộc thứ tự xen kẽ của các thao tác đồng thời |
| Atomic update | Cập nhật có điều kiện tại DB như tăng tồn kho nếu còn đủ |
| Pessimistic locking | Khóa bi quan: giữ khóa DB khi sửa; hiện có ở findByIdForUpdate |
| Optimistic locking | Khóa lạc quan: kiểm tra version khi ghi; chưa có @Version hiện tại |
| Idempotency | Thực hiện lặp lại có kết quả tương đương; cần phân biệt retry tuần tự và cạnh tranh |
| Snapshot giá | Giá đóng băng ở BookingItem, không lấy lại giá loại vé khi trả tiền |
| Unit test | Test một thành phần, thường mock phụ thuộc; không chứng minh khóa DB |
| Integration test | Test các thành phần ghép thật, ví dụ Spring context/H2 |
| ADR | Bản ghi quyết định kiến trúc và trade-off |
| N+1 | Một truy vấn danh sách rồi thêm nhiều truy vấn cho các quan hệ từng dòng |
| soldQuantity | Tên trường hiện tại; working tree đang dùng cả cho chỗ đã giữ và đã xác nhận |

Các khái niệm kỹ thuật được giải thích bằng use case tại [giáo trình](../learning/README.md), không chỉ bằng định nghĩa.
