# Bài 3. Object đổi lúc nào, DB đổi lúc nào?

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Set field, flush và commit khác nhau ở đâu?

Sau bài này, bạn có thể:

- Phân biệt transient, managed, detached, flush và commit.
- Giải thích MappedSuperclass và auditing listener.
- Thiết kế test audit persist/update/bulk từ DB reload.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Bài response/lỗi có thể đọc sau Auth; auditing sau Ticket; scheduling sau Booking và Waitlist.

## Tình huống và cách nghĩ

User được tạo bằng builder trong unit test.

Persistence context là nơi JPA theo dõi entity đang managed. Dirty checking so thay đổi để phát SQL khi
flush. Commit kết thúc transaction; flush trước đó vẫn có thể rollback. BaseEntity chia sẻ mapping
ID/timestamps bằng MappedSuperclass, không tạo bảng cha để JOIN.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

BaseEntity @MappedSuperclass chia sẻ mapping id/timestamps, không tạo bảng cha. @GeneratedValue(UUID)
tạo khóa, listener AuditingEntityListener cùng @EnableJpaAuditing gán createdAt/updatedAt khi
persist/update trong cơ chế JPA. EventHub dùng createdAt cho timeout booking; nếu thiếu timestamp, job
không chọn đúng đơn.

Persistence context quản lý entity loaded/persisted; dirty checking phát hiện thay đổi khi flush,
detached object không tự ghi nếu chỉ set field ngoài context. Auditing không phải lịch sử mọi thay đổi
hay người thao tác; chỉ timestamps. Bulk JPQL update có thể bỏ qua callback entity, nên không mặc định
reserve cập nhật updatedAt như save entity. Cần test DB khi audit của bulk update quan trọng.

Thay thế: DB default/trigger giúp các đường SQL ngoài JPA cũng có timestamp nhưng phải quản lý DDL;
event audit log chi tiết phục vụ truy vết khác mục tiêu hai timestamp. Hiện chưa cần bảng audit mọi
field nếu chưa có yêu cầu. Debug createdAt null bằng auditing listener/context và cách entity được tạo;
unit test object builder không chạy listener.

Context/UserRepositoryTest dùng Spring/H2 đã chạy; test proposed persist/update/audit bulk boundaries.

## Cùng trace source

Mở theo thứ tự: [BaseEntity](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/entity/BaseEntity.java) → [Entry point](../../../../backend/src/main/java/com/eventhub/eventhub_backend/EventhubBackendApplication.java).

Điểm cần tìm: `BaseEntity mapping; auditing listener`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [BaseEntity, dòng 17](../../../../backend/src/main/java/com/eventhub/eventhub_backend/common/entity/BaseEntity.java#L17); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)   // ← thêm dòng này
public class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    Instant updatedAt;
}
```

Đọc khai báo này cùng field/kiểu và nơi gọi nó. Annotation hay interface không tự chứng minh toàn bộ
request: DTO cần validation pipeline, mapper cần nhánh service phù hợp, query cần transaction và DB
thật. Chọn ranh giới liên quan đến ví dụ trong bài.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

User được tạo bằng builder trong unit test.

1. Builder chỉ tạo object, chưa có JPA lifecycle.
2. Persist trong Spring context có auditing listener mới có cơ hội gán timestamp.
3. Flush gửi insert/update; commit quyết định thành công transaction.
4. Bulk JPQL reserve đi thẳng update, không mặc định chạy audit callback cho từng TicketType.

**Dừng lại và dự đoán:** updatedAt có chứng minh ai sửa giá và giá trước đó không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. Hai timestamp không phải audit trail; chưa lưu actor/giá trị cũ ở cơ chế này.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Set field, flush và commit khác nhau ở đâu?
2. Trace hoặc dự đoán: updatedAt có chứng minh ai sửa giá và giá trước đó không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Persistence context là nơi JPA theo dõi entity đang managed. Dirty checking so thay đổi để phát SQL
   khi flush. Commit kết thúc transaction; flush trước đó vẫn có thể rollback. BaseEntity chia sẻ
   mapping ID/timestamps bằng MappedSuperclass, không tạo bảng cha để JOIN.

2. Không. Hai timestamp không phải audit trail; chưa lưu actor/giá trị cũ ở cơ chế này.

3. Lần theo `BaseEntity mapping; auditing listener` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Thiết kế test audit persist/update/bulk từ DB reload. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Thiết kế test persist/update bằng saveAndFlush, clear rồi reload; thêm case bulk
reserve và quan sát updatedAt thay vì đoán.

**Tự làm:** Một script SQL ngoài JPA đổi dữ liệu. Tự dự đoán auditing listener có chạy không, so DB
trigger với entity callback và yêu cầu audit trail; ghi phương án mới là đề xuất.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Phân biệt transient/managed/detached; object detached set field không tự ghi DB.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi có kiểm DB sau reload, không assert listener chạy ở builder thuần và không nhầm flush với commit.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

BaseEntity chia sẻ mapping, không có bảng cha. Auditing gán timestamp theo JPA lifecycle, không phải
lịch sử actor/giá trị cũ. Builder thuần và bulk SQL không tương đương entity persist/update qua
listener.

[← Bài trước](02-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](04-co-che.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
