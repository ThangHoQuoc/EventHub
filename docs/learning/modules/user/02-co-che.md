# Bài 2. “Tôi” được xác định ở đâu?

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao API me không cần userId trong body?

Sau bài này, bạn có thể:

- Trace principal từ filter đến GET me.
- Phân biệt getName=userId với email client gửi.
- Chỉ assumption thiếu guard và authority đầu tiên.

**Cần biết trước:** [Bài toán module](01-bai-toan.md). Hoàn thành Auth, đặc biệt principal và SecurityContext.

## Tình huống và cách nghĩ

Lan có principal U1 nhưng sửa body thành userId U2.

Danh tính xác thực là kết quả của kiểm tra phía server. ID client gửi chỉ là một lời khai. Với “me”,
nguồn quyết định là principal mà filter đã đặt. getName không có nghĩa cố định là email: trong EventHub
nó trả userId vì cách tạo Authentication.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

Khái niệm: một nơi framework giữ Authentication đang xử lý, giúp service biết ai gọi mà không tin userId
trong body. EventHub cần nó để getMyBookings hoặc ownership dùng cùng danh tính. Trong implementation,
getName là userId vì JWT filter đã đặt principal như vậy; không mặc định mọi ứng dụng Spring đều
getName=email.

getCurrentUserRole lấy authority đầu tiên, bỏ prefix ROLE_ rồi Role.valueOf. Cách này hoạt động với
filter hiện chỉ tạo một role, nhưng nếu sau này thêm permission authorities thì “authority đầu tiên là
role” không còn chắc. Phương án khác là principal có type rõ hoặc lọc authority role; thêm abstraction
chỉ khi thay đổi mô hình thực sự cần.

Runtime: context → Authentication → principal/authority; user profile còn cần DB lookup. Debug sai user
bằng breakpoint chỗ filter set principal rồi getName, không sửa query trước khi biết input. Test đề xuất
null/anonymous/nhiều authority vì chưa thấy CurrentUserServiceImplTest.

## Cùng trace source

Mở theo thứ tự: [implementation](../../../../backend/src/main/java/com/eventhub/eventhub_backend/user/service/Impl/CurrentUserServiceImpl.java) → [UserController](../../../../backend/src/main/java/com/eventhub/eventhub_backend/user/controller/UserController.java).

Điểm cần tìm: `getCurrentUser; getCurrentUserId; getCurrentUserRole`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [CurrentUserServiceImpl, dòng 41](../../../../backend/src/main/java/com/eventhub/eventhub_backend/user/service/Impl/CurrentUserServiceImpl.java#L41); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
    public String getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return authentication.getName();
    }
```

Đọc khối này trong method bao quanh: điều kiện trước nó quyết định có đến được đây không,
caller/transaction phía ngoài quyết định thay đổi có commit không. Không dùng riêng snippet để suy ra
toàn bộ flow.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Lan có principal U1 nhưng sửa body thành userId U2.

1. GET me không nhận body userId để chọn tài khoản.
2. getCurrentUser đọc Authentication.getName, nhận U1.
3. Repository tìm U1 và mapper tạo profile U1.
4. Đây không thay thế kiểm tra owner ở API nhận resourceId như booking detail.

**Dừng lại và dự đoán:** Scheduler gọi getCurrentUserId mà không có Authentication: có tự chọn admin không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. Helper truy cập context trực tiếp và có thể lỗi khi Authentication null. Tác vụ nền không có
người dùng HTTP mặc định.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao API me không cần userId trong body?
2. Trace hoặc dự đoán: Scheduler gọi getCurrentUserId mà không có Authentication: có tự chọn admin không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Danh tính xác thực là kết quả của kiểm tra phía server. ID client gửi chỉ là một lời khai. Với “me”,
   nguồn quyết định là principal mà filter đã đặt. getName không có nghĩa cố định là email: trong
   EventHub nó trả userId vì cách tạo Authentication.

2. Không. Helper truy cập context trực tiếp và có thể lỗi khi Authentication null. Tác vụ nền không có
   người dùng HTTP mặc định.

3. Lần theo `getCurrentUser; getCurrentUserId; getCurrentUserRole` trong các file đã dẫn; câu trả lời
   phải có tên field/điều kiện, không chỉ nói “service kiểm tra”.

4. Chỉ assumption thiếu guard và authority đầu tiên. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Lập ba ca test thiết kế cho getCurrentUser: null Authentication, principal U1 tồn tại
và U1 không tồn tại; thêm một ca nhiều authority cho helper role.

**Tự làm:** Fixture có authorities ROLE_CUSTOMER và một permission đặt trước. Tự dự đoán
getCurrentUserRole, rồi đề xuất assertion và cách đọc role có chủ đích; tách hiện tại khỏi đề xuất.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Đọc riêng getCurrentUser, getCurrentUserId và getCurrentUserRole; đừng giả sử ba helper có cùng guard.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi phân biệt behavior hiện tại với behavior đề xuất, và chỉ ra assumption authority đầu tiên.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

“Me” lấy danh tính từ Authentication server đã thiết lập. getName là userId trong EventHub. Helper
ID/role dựa vào context và shape authority, nên không dùng như thể job nền luôn có user HTTP.

[← Bài trước](01-bai-toan.md) · [Mục lục module](README.md) · [Học tiếp →](03-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
