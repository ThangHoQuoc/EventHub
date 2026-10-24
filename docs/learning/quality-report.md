# Báo cáo biên tập giáo trình

Ngày đối chiếu: 09/10/2026. Căn cứ là working tree, gồm cả thay đổi backend có sẵn trước nhiệm vụ; giáo trình không thay đổi chúng. Không suy từ product roadmap thành tính năng đã triển khai.

## Cấu trúc và cách dùng

```text
learning/
  README.md                 Trang bắt đầu, chỉ một bài đầu tiên
  start-here.md             Bài mở đầu với bài tập số liệu
  learning-path.md          Thứ tự và prerequisite/nhánh tra cứu
  how-to-study.md           Buổi học, ghi chú và cách dùng AI
  review-system.md          Ôn linh hoạt và câu hỏi nối module
  modules/
    README.md              Checklist phạm vi
    <module>.md            Giữ đường dẫn cũ, dẫn đến bài mới
    <module>/README.md     Ba chương và thứ tự bài
    <module>/01-...md      Bài toán, actor và source trace
    <module>/02-...md ...  Các cơ chế theo câu hỏi trung tâm
    <module>/...kiem...md  Debug/test/thiết kế độc lập
  assets/
    sources/               JSON, render.py, verify.py, manifest/excerpts
    rendered/              SVG nhúng trong bài
```

Chương là nhóm sư phạm trong README module; không thêm tầng thư mục chương chỉ để tăng số click. Mỗi bài có điều hướng trước/sau. Trang mở đầu dành cho buổi đầu; reference API/data/domain chỉ đọc khi bài cần.

## Phạm vi đã biên tập

| Module | Bài | Cơ chế tập trung |
|---|---|---|
| [Auth](modules/auth/README.md) | 5 | BCrypt/DI; token→context→policy; validation/UNIQUE |
| [User](modules/user/README.md) | 4 | Current identity; DTO/entity và generic repository |
| [Event](modules/event/README.md) | 5 | Lifecycle/owner; PATCH/null; Criteria/count/sort |
| [Ticket](modules/ticket/README.md) | 5 | Invariant; derived availability; owning FK/fetch/cascade |
| [Booking](modules/booking/README.md) | 5 | Aggregation/snapshot; atomic reserve; transaction/release |
| [Payment](modules/payment/README.md) | 5 | Key scope; cross-bean transaction; trust/amount |
| [Ticketing](modules/ticketing/README.md) | 5 | Identity/issuance; double-scan; QR lookup/quyền |
| [Waitlist](modules/waitlist/README.md) | 5 | Oldest eligible; offer≠reserve; expiry/replay/rollback |
| [Common/config](modules/common-config/README.md) | 5 | Response/error boundary; auditing; scheduler/cutoff |

Tổng: **44 bài module + 1 bài mở đầu**. Admin test quyền được đặt ở Common/config; util rỗng không được dựng thành feature giả. Frontend nằm ngoài giáo trình backend này.

## Khác biệt so với guide cũ

Khảo sát ban đầu cho thấy chín guide dồn nghiệp vụ, bảng source, nhiều cơ chế và bài tập vào một file; 26 tiểu mục kỹ thuật chưa có nhịp dừng rõ. Các câu hỏi chưa có đáp án tách khỏi lúc đọc; hình chủ yếu là trace toàn module; chưa có cách học/ôn từng buổi.

Giáo trình mới giữ nền tảng đúng nhưng thêm mô hình trực giác, ví dụ giải từng bước, biến thể tự dự đoán, bài tự làm riêng theo topic và rubric. Các kết luận quan trọng được gọi lại ở module sau với câu hỏi mới. Mục tiêu không chỉ là chia file: người đọc có đường đọc, điểm dừng và hoạt động chứng minh hiểu.

| Nội dung cũ của cả chín guide | Chỗ mới | Cách bảo toàn/biên tập |
|---|---|---|
| A–B: actor, domain, phạm vi | Bài 1 mỗi module | Giữ rule và giới hạn; thêm ví dụ dự đoán |
| C: source map | Bài 1 và link tập trung trong từng bài | Giữ link file thật; đổi độ sâu tương đối |
| D: request/data trace | Bài 1 | Giữ trace/hình đúng; thêm hướng dẫn đọc và điểm dừng |
| E: 26 tiểu mục kỹ thuật | Chương 2, 26 bài | Biên tập đoạn ngắn; thêm nền tảng, snippet, số liệu, luyện tập |
| F–G: thiết kế/test/debug | Bài cuối module và cơ chế liên quan | Giữ giới hạn; phân biệt kết quả khảo sát trước với test đề xuất |
| I: câu hỏi/bài tập/checklist | Recall, biến thể, rubric và bài tổng hợp | Viết lại theo mức tăng dần; giấu đáp án; giữ các chủ đề quan trọng |
| Các URL `modules/<module>.md` | Trang chuyển hướng bằng link Markdown | Link cũ từ docs khác còn mở được; không xóa tài liệu reference |

## Hình và những phần đào sâu

Tạo **16 SVG mới**, source JSON và bộ render standard library ở [assets](assets/README.md). Dùng các cách biểu diễn khác nhau: so sánh, bảng trước/sau, timeline cạnh tranh, state machine, object↔FK và vùng transaction. Dùng lại hình hệ thống đúng hiện có, không tạo lại kiến trúc cấp hệ thống.

Các phần đào sâu đáng chú ý: precheck khác conditional write; pending đã giữ chỗ; snapshot giá; flush/commit/rollback; proxy và cross-bean REQUIRED; lock TicketType chưa khóa Booking transition; unique key khác idempotency đồng thời; state cuối USED khác một admission; offer không reserve; save(EXPIRED) rồi throw khác commit; derived query là policy; JPA owning side/fetch/cascade; authority lấy DB và exception trước MVC.

## Kiểm chứng và giới hạn

Kết quả kiểm tĩnh, đối chiếu source và kiểm hình được ghi ở phần kết quả bên dưới sau khi chạy [verify.py](assets/sources/verify.py). Công cụ này kiểm link, snippet nguyên văn/vị trí, cấu trúc hoạt động học, XML SVG, source/render đồng bộ và tùy chọn hash phạm vi.

Không chạy lại suite ứng dụng trong nhiệm vụ docs này. Kết quả 83 tests ở [verification cũ](../project/verification.md) là khảo sát trước, không được dùng như bằng chứng các race đã an toàn. Test mới trong bài là bài tập/đề xuất; chưa được thêm vào backend. Không xác minh schema production hay tái hiện race trên PostgreSQL trong nhiệm vụ này.

Đã kiểm nội dung theo source/DTO/entity/query/caller/test liên quan, nhưng kiểm tĩnh không chứng minh người học nhớ lâu. Thời lượng cần điều chỉnh theo tốc độ thực tế; bài integration/capstone có thể cần buổi riêng. Chưa có buổi thử với học viên hoặc đo mức độ ghi nhớ. Không có module trong phạm vi bị để trống.

## Bạn bắt đầu ở đâu?

Đọc [bài mở đầu](start-here.md), tự làm bài capacity8/sold2/đặt3, rồi [Auth bài 1](modules/auth/01-bai-toan.md). Sau đó đi link “Học tiếp” từng bài. Module sau cũng bắt đầu ở README module, không tự chọn giữa các file source.

## Kết quả kiểm tra đã thực hiện

- Kiểm 109 Markdown trong docs cùng README/AGENTS, 998 liên kết nội bộ và 36 lần nhúng hình: không phát hiện link/anchor hỏng.
- Kiểm 45 bài: câu hỏi trung tâm, prerequisite, recall 3–6 câu, vùng đáp án thu gọn, code fence và điều hướng. Manifest khớp các bài thực tế.
- Đối chiếu 26 đoạn trích Java với nguyên văn và số dòng source: khớp.
- 16 SVG mới: XML hợp lệ, có title/description, được nhúng trong bài và render lại giống source JSON. 10 SVG hệ thống dùng lại, tổng 26 hình duy nhất được nhúng.
- Đã render và xem cả 16 hình qua bốn gallery Chrome; xem thử Markdown của bài mở đầu, Booking transaction và mục lục Auth bằng markdown-it/Chrome có sẵn. Đáp án thu gọn không mở sẵn; hình/heading/bảng hiển thị trong nội dung. Không cài dependency.
- Hash trước/sau: 91 file trong learning mới hoặc được biên tập; **không thay đổi byte nào của application source/test/config hoặc tài liệu reference ngoài learning** so với baseline.
- Có một thay đổi ngoài learning được quan sát ở `AGENTS.md` trong lúc làm việc, không nằm trong các thao tác ghi của đợt biên tập này. Đã đọc hướng dẫn mới và giữ nguyên; không hoàn tác hoặc gán thay đổi đó cho giáo trình. Bộ kiểm báo riêng đường dẫn này, không che nó khỏi kết quả phạm vi.
- Không chạy lại Maven test, không xác minh DB production và không coi các bài thiết kế test như test đã pass.

Lệnh kiểm lặp lại: `python docs/learning/assets/sources/verify.py`. Để so phạm vi với baseline SHA256 riêng, đặt `EVENTHUB_LEARNING_BASELINE` trỏ tới JSON đã chụp trước khi biên tập; công cụ báo mọi thay đổi ngoài learning và fail nếu application thay đổi. Baseline của buổi làm việc được giữ ở thư mục tạm, không đưa toàn repository hash vào giáo trình.

