# Bài 4. Tìm kiếm là tổ hợp điều kiện

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Tình huống và cách nghĩ](#tình-huống-và-cách-nghĩ) · [Cùng trace source](#cùng-trace-source) · [Luyện từ có hướng dẫn đến tự làm](#luyện-từ-có-hướng-dẫn-đến-tự-làm)

**20–30 phút · Chương 2: Cơ chế và dữ liệu**

**Câu hỏi trung tâm:** Vì sao lọc theo khoảng thời gian có thể loại Event giao nhau với khoảng tìm?

Sau bài này, bạn có thể:

- Áp đúng OR/AND và cận thời gian trong Criteria.
- Tính content, totalElements và totalPages.
- Chỉ giới hạn sort input và hai query data/count.

**Cần biết trước:** [Bài toán module](01-bai-toan.md); bài ngay trước theo thanh điều hướng cuối trang. Hoàn thành User; phân biệt role và ownership.

## Tình huống và cách nghĩ

Khoảng tìm 10:00–12:00, Event A 09:00–11:00 và B 10:30–11:30 (dữ liệu thời gian minh họa).

Predicate là điều kiện đúng/sai gắn với một bản ghi. Criteria kết hợp các điều kiện thành query thay vì
tải mọi Event rồi lọc Java. Phân trang cần hai thông tin: trang dữ liệu và tổng số bản ghi cùng điều
kiện. Count không phải số phần tử của trang.



## Cơ chế trong EventHub

Phần dưới dựa trên source working tree. Phương án thay thế là phân tích/đề xuất; race cần test riêng
trước khi kết luận runtime.

Criteria API tạo cây truy vấn kiểu object thay vì nối SQL từ input. EventSpecification gom Predicate:
status=PUBLISHED luôn có, keyword LIKE lower(title) OR lower(description), location LIKE, category bằng
nhau, cận thời gian. EventRepositoryImpl dùng EntityManager tạo data query, applySorting, offset/limit
và count query riêng. Hai query phải dùng cùng predicates để totalElements nhất quán với tập kết quả.

Project cần search optional filters mà không tạo method cho mọi tổ hợp. Derived query đủ cho
findByStatus nhưng không tiện cho nhiều filter tùy chọn. Thay thế: Spring Data
Specification/QueryDSL/native SQL; mỗi cách đổi mức type-safety, build tooling và quyền kiểm soát SQL.
Chưa có QueryDSL dependency.

Runtime count có thể thấy snapshot khác data query nếu dữ liệu thay đổi đồng thời, vì chưa có
transaction service search bao ngoài được xác minh. Sort dùng property input trực tiếp, chưa whitelist;
sai tên có thể lỗi runtime. LIKE wildcard đầu có thể không dùng index B-tree hiệu quả: cần đo PostgreSQL
EXPLAIN trước khi chọn giải pháp. Test getEvents hiện mock page repository, không test SQL predicates
thật.

## Cùng trace source

Mở theo thứ tự: [EventSpecification](../../../../backend/src/main/java/com/eventhub/eventhub_backend/event/repository/Impl/EventSpecification.java) → [EventRepositoryImpl](../../../../backend/src/main/java/com/eventhub/eventhub_backend/event/repository/Impl/EventRepositoryImpl.java) → [EventSearchRequest](../../../../backend/src/main/java/com/eventhub/eventhub_backend/event/dto/request/EventSearchRequest.java).

Điểm cần tìm: `buildPredicates; searchEvents; applySorting`. Với mỗi guard, ghi input và kết quả khi đúng/sai; với mỗi setter/query, ghi dữ liệu thay đổi ở object hay DB. Tra [bảng source module](01-bai-toan.md) nếu cần DTO hoặc test liên quan.

Đoạn trích nguyên văn từ [EventSpecification, dòng 81](../../../../backend/src/main/java/com/eventhub/eventhub_backend/event/repository/Impl/EventSpecification.java#L81); chỉ là phần cần quan sát, không phải toàn bộ method:

```java
        if (request.getStartAt() != null) {

            predicates.add(
                    cb.greaterThanOrEqualTo(
                            event.get("startAt"),
                            request.getStartAt()
                    )
            );
        }
```

Đọc khai báo này cùng field/kiểu và nơi gọi nó. Annotation hay interface không tự chứng minh toàn bộ
request: DTO cần validation pipeline, mapper cần nhánh service phù hợp, query cần transaction và DB
thật. Chọn ranh giới liên quan đến ví dụ trong bài.

## Ví dụ được giải từng bước

**Ví dụ minh họa**, dùng ID/số liệu giả; không phải request ghi vào môi trường thật.

Khoảng tìm 10:00–12:00, Event A 09:00–11:00 và B 10:30–11:30 (dữ liệu thời gian minh họa).

1. Source dùng start >= startAt và end <= endAt.
2. A không thỏa start>=10:00 dù có giao nhau.
3. B nằm trọn khoảng nên qua điều kiện thời gian.
4. Cả hai vẫn phải PUBLISHED và thỏa keyword/location/category nếu truyền.

**Dừng lại và dự đoán:** Có 23 kết quả, page size=10, page index=2: content và totalElements có bằng
nhau không?

<details>
<summary>Đối chiếu sau khi đã tự trả lời</summary>

Không. Với dữ liệu ổn định, content=3, totalElements=23, totalPages=3; page index bắt đầu từ 0.

</details>

## Tự nhớ lại, không nhìn lên trên

1. Giải thích bằng lời: Vì sao lọc theo khoảng thời gian có thể loại Event giao nhau với khoảng tìm?
2. Trace hoặc dự đoán: Có 23 kết quả, page size=10, page index=2: content và totalElements có bằng nhau không?
3. Tìm trong source một guard, query hoặc mapping quyết định kết quả; nó đọc/ghi dữ liệu nào?
4. Bài tập có hướng dẫn muốn chứng minh tính chất nào? Dependency nào phải chạy thật để chứng minh nó?

<details>
<summary>Đáp án và cách kiểm tra</summary>

1. Predicate là điều kiện đúng/sai gắn với một bản ghi. Criteria kết hợp các điều kiện thành query thay
   vì tải mọi Event rồi lọc Java. Phân trang cần hai thông tin: trang dữ liệu và tổng số bản ghi cùng
   điều kiện. Count không phải số phần tử của trang.

2. Không. Với dữ liệu ổn định, content=3, totalElements=23, totalPages=3; page index bắt đầu từ 0.

3. Lần theo `buildPredicates; searchEvents; applySorting` trong các file đã dẫn; câu trả lời phải có tên
   field/điều kiện, không chỉ nói “service kiểm tra”.

4. Chỉ giới hạn sort input và hai query data/count. Đối chiếu gợi ý/rubric bài tập: thuật toán cần
   encoder/mapper thật; query/constraint/rollback/lock cần DB phù hợp; routing/validation/security HTTP
   cần pipeline thật. Chọn phần đúng bài này, không chạy mọi tầng vô điều kiện.

</details>

## Luyện từ có hướng dẫn đến tự làm

**Có hướng dẫn:** Viết bảng dữ liệu giả năm Event khác trạng thái/thời gian; tự áp từng predicate rồi
tính hai trang. Thêm sort field không tồn tại và tìm nơi root.get được gọi.

**Tự làm:** Có 21 Event PUBLISHED cùng keyword, size10; một Event được thêm giữa data và count query.
Phân biệt kết quả ổn định bạn tính tay với snapshot nhất quán chưa được bảo đảm.

<details>
<summary>Gợi ý khi mắc kẹt</summary>

Tách OR giữa title/description khỏi AND giữa nhóm keyword và các điều kiện còn lại.

</details>

<details>
<summary>Rubric tự chấm</summary>

Đạt khi không đổi containment thành overlap, count dùng cùng filter và nêu thiếu whitelist sort là giới hạn.

Tự cho 0–2 điểm mỗi mục: expected rõ; bằng chứng source đúng; giải thích cơ chế; phân biệt giới hạn
test. Đạt từ 6/8 và không sai invariant chính. Điểm này giúp chọn chỗ ôn, không chứng nhận năng lực
production.

</details>

## Giữ lại điều cốt lõi

Search luôn lọc PUBLISHED, keyword OR trong một nhóm rồi AND với các filter. Cận thời gian là nằm trọn
khoảng. Data và count là hai query; sort chưa có whitelist và mock page chưa test SQL thật.

[← Bài trước](03-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](05-tu-kiem-chung.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
