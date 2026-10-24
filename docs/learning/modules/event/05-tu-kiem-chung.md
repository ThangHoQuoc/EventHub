# Bài 5. Tự kiểm chứng Event

[Giáo trình](../../README.md) · [Mục lục module](README.md)

**Trong bài:** [Bài tập ba mức](#bài-tập-ba-mức)

**25–30 phút · Chương 3: Debug, test và tự thiết kế**

**Câu hỏi trung tâm:** Tôi có thể chứng minh kết luận bằng source và test phù hợp thay vì đoán theo
triệu chứng không?

Sau bài này, bạn có thể:

- Khoanh vùng lỗi bằng một trace có dữ liệu cụ thể.
- Chọn unit, HTTP hoặc DB test đúng với điều muốn chứng minh.
- Đề xuất thay đổi nhỏ và nêu ảnh hưởng, trade-off, tiêu chí chấp nhận.

**Cần biết trước:** Hoàn thành các bài chương 2 của [module](README.md). Đây là bài thiết kế test trong khoảng 30 phút; triển khai integration test đầy đủ có thể cần một buổi riêng trong nhánh học tập.

## Phòng khám lỗi: PATCH thành công nhưng category không đổi

Người dùng chỉ đưa triệu chứng này, bạn chưa biết nguyên nhân. Đừng sửa dòng đầu tiên nhìn thấy. Viết ba
dòng: dữ liệu đầu vào, kết quả mong muốn, quan sát thực tế; nếu chưa có log/test thì ghi thiếu bằng
chứng.

**Ví dụ suy luận được giải:** Ở PUBLISHED, service set tay title/description/location. Mapper
null-ignore dùng nhánh DRAFT không giải thích được việc bỏ category ở nhánh kia.

1. Tìm điểm quyết định trong service và dependency của nó ở [bản đồ source](01-bai-toan.md).
2. Chọn fixture nhỏ để đi đúng nhánh; loại bỏ biến không liên quan.
3. Tách điều unit mock nhìn thấy khỏi behavior của framework/DB cần chạy thật.
4. Chỉ đề xuất sửa sau khi có assertion thất bại đáng tin.

**Thử biến thể:** Nếu mock test hiện có pass nhưng giả thuyết nói DB sai, bạn cần bỏ test cũ hay thêm
một loại bằng chứng khác?

<details>
<summary>Đáp án biến thể</summary>

Giữ test nhánh còn giá trị và thêm test đúng tầng cần chứng minh. Không sửa expected để che lỗi, cũng
không coi mock pass là kết luận commit/locking/schema đúng.

</details>

## Đọc thiết kế và test hiện có

Điểm tốt: DTO/mapper và ownership rõ cho thao tác quản lý, public detail không đòi context. Coupling:
event đọc UserRepository và CurrentUserService; chưa có domain aggregate cưỡng chế mọi mutation.
completeExpiredEvents có transaction; create/update/publish/cancel không có transaction service bao
ngoài. Nguy cơ cập nhật tranh chấp cần tái hiện, chưa gọi là lỗi production.

18 tests module đã chạy. Breakpoint publish: find→state→fields/time→ownership→save. Search:
buildPredicates→applySorting→query results→count. Quan sát timestamp bằng Instant/UTC, không so chuỗi
giờ local. Đề xuất Clock injectable trong task code sau để test mốc thời gian chính xác; docs không thêm
dependency hay sửa source.

Các kết quả “đã chạy” trong tài liệu gốc là bằng chứng khảo sát trước, không phải lần chạy mới của đợt
biên tập giáo trình. Bài này yêu cầu bạn đọc test/assertion; test đề xuất bên dưới chưa được bổ sung vào
application.

## Bài tập ba mức

1. **Trace:** Vẽ đường DRAFT→PUBLISHED và đánh dấu role, owner, nội dung, thời gian; so với đường cancel.
2. **Test/debug:** Lập bảng PATCH title-only/null/category/time cho DRAFT và PUBLISHED, chọn assertion
   dựa từng branch.
3. **Thiết kế độc lập:** Đề xuất hợp đồng clear field phân biệt absent/null; nêu ảnh hưởng DTO,
   validation, mapper và client.

Chọn mức 1–2 trong buổi đầu; mức 3 có thể làm sau khi ôn. Đọc [cách học](../../how-to-study.md) trước khi nhờ AI góp ý.

<details>
<summary>Gợi ý từng mức</summary>

1. Dùng source map, ghi guard và dữ liệu trước/sau.
2. Đi từ triệu chứng “PATCH thành công nhưng category không đổi”; phân loại cái cần chứng minh là nhánh
   Java, HTTP hay commit/concurrency.
3. Viết invariant trước phương án. Dùng bảng hiện tại/đề xuất/test để không nhầm feature đang có.

</details>

<details>
<summary>Rubric và đáp án định hướng</summary>

Mức 1: actor, thứ tự method, guard và kết quả đều khớp source.

Mức 2: Ở PUBLISHED, service set tay title/description/location. Mapper null-ignore dùng nhánh DRAFT
không giải thích được việc bỏ category ở nhánh kia. Test cần setup, action, assertion, loại runtime và
ít nhất một negative case; không chỉ verify lời gọi save.

Mức 3: có invariant, phương án, ảnh hưởng tới caller/API/dữ liệu/quyền nếu liên quan, và một trade-off.
Không có một đáp án kiến trúc duy nhất; nêu lý do loại phương án khác. Chưa đạt nếu chỉ thêm công nghệ
mà không xác định điểm quyết định.

</details>

## Tự nhớ lại cuối module

1. Kể luồng happy path trong 90 giây không mở bài.
2. Với triệu chứng đầu bài, dữ liệu nào cần quan sát trước? Trace tới điểm quyết định.
3. Một test hiện có chứng minh điều gì? Một test còn thiếu phải chạy ở tầng nào?
4. Nếu thay đổi theo đề xuất của bạn, invariant nào phải giữ và test nào phát hiện regression?

<details>
<summary>Tự đối chiếu</summary>

Câu 1 đối chiếu trace bài 1; câu 2 đối chiếu phòng khám lỗi; câu 3 phải chỉ tên test thật trong source
map và dependency được mock; câu 4 dùng acceptance criteria ở bài thiết kế. Không nhớ tên annotation
không nghiêm trọng bằng giải thích sai dữ liệu/state.

</details>

## Ra khỏi module khi nào?

- [ ] Tự giải thích nhu cầu, rule và một failure path.
- [ ] Tự vẽ luồng và mở đúng method từ trí nhớ.
- [ ] Làm một biến thể không cần AI viết lời giải.
- [ ] Nêu một giới hạn hiện tại và test để kiểm chứng.

Nếu còn yếu mục nào, ôn đúng bài đó theo [hệ thống ôn](../../review-system.md), rồi quay lại bài tập. Không cần đọc lại cả module.

[← Bài trước](04-co-che.md) · [Mục lục module](README.md) · [Học tiếp →](../ticket/README.md)

Nếu chưa giải thích được câu hỏi trung tâm, làm lại biến thể trước khi học tiếp; không cần đọc thêm mọi
tài liệu tham khảo.
