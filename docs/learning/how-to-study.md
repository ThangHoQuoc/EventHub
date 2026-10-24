# Cách học một bài mà không chỉ thấy “quen mắt”

Mục tiêu một buổi là giải thích được một cơ chế và tự dự đoán một biến thể. Không cần ghi nhớ toàn bộ class ngay.

## Một buổi khoảng 25 phút

1. **3 phút — nhớ lại:** đóng bài cũ, kể flow hoặc trả lời một câu hôm trước. Nếu quên, ghi câu hỏi trước khi xem lại.
2. **7 phút — đọc ví dụ:** đọc câu hỏi trung tâm, tình huống, mô hình. Dùng hình để dự đoán bước tiếp theo; đừng mở đáp án ngay.
3. **7 phút — mở source:** chỉ mở các file bài dẫn, tìm method/guard/query. Ghi dữ liệu trước/sau trên giấy; không đọc toàn bộ package.
4. **5 phút — tự làm:** giải biến thể hoặc viết setup/action/assertion của một test. Làm bản đầu không nhờ AI viết.
5. **3 phút — kiểm và ghi:** mở đáp án thu gọn, sửa lập luận sai, ghi một câu cần ôn. Bấm “Học tiếp” vào buổi sau.

Thời gian linh hoạt. Bài transaction có thể cần hai buổi; đừng ép tốc độ. Nếu chưa hiểu từ khóa, chỉ tra nghĩa đủ để giải tình huống hiện tại.

## Ghi chú nhỏ, bằng lời của mình

Sao chép mẫu này vào sổ riêng; không cần thêm một hệ thống ghi chú phức tạp:

```text
Bài / ngày:
Câu hỏi trung tâm:
Tôi giải thích trong 3 câu:
Input → guard → data change → output:
Method/field làm bằng chứng:
Tôi dự đoán sai điều gì? Vì sao?
Một câu sẽ tự hỏi ngày mai:
Test: setup / action / assertion / tầng cần chạy thật:
```

Ví dụ ghi chú sau Booking: “Pending tăng soldQuantity để giữ chỗ. Java precheck có thể cũ; conditional update và row count mới quyết định. Confirm không tăng lần hai.” Ngày mai tự hỏi: “Tại sao @Transactional chưa đủ chống hai người cùng mua vé cuối?”

## Khi bị kẹt

Đọc lại ví dụ nhỏ và thu input còn một item/một state/một caller. Đánh dấu chỗ không nối được: từ DTO đến service, từ object đến SQL, hay từ exception đến response. Mở gợi ý một lần, tự viết tiếp rồi mới xem đáp án. Nếu vẫn sai, quay prerequisite ghi trong bài.

Đừng sửa production để thử ngẫu nhiên. Bài đọc/trace có thể làm bằng giấy; bài Java nhỏ dùng dữ liệu giả; bài test triển khai trong nhánh học tập riêng khi bạn sẵn sàng. Giáo trình hiện giao nhiều bài thiết kế test, không giả vờ những test ấy đã có.

## Nhờ AI để phản hồi, không thay phần tự nghĩ

Trước khi hỏi, phải có dự đoán hoặc bản giải thích của bạn. Có thể dùng:

> Tôi đang học [bài]. Đây là cách tôi trace: [...]. Hãy hỏi tôi từng câu để tìm chỗ sai; chưa đưa lời giải hoặc viết code thay tôi. Khi tôi trả lời, đối chiếu source và giải thích đúng một điểm cần sửa.

Hoặc:

> Hãy cho một biến thể nhỏ về [cơ chế], giấu đáp án. Sau khi tôi trả lời, chấm theo invariant và bằng chứng source, rồi yêu cầu tôi giải thích lại.

Sau phản hồi, đóng chat và tự làm một biến thể khác. Nếu chỉ chép được lời AI nhưng không dự đoán được dữ liệu, bài chưa hoàn thành.

## Chuẩn bị chạy test khi đến phần thực hành

Xem [commands-and-testing](../development/commands-and-testing.md) để chọn JDK 21, test profile và lệnh thật. Mockito không chạy transaction/SQL/security chain. H2 thuận tiện cho persistence cơ bản; race và hành vi PostgreSQL cần DB phù hợp. Không đưa credentials, JWT hoặc vé của người thật vào ghi chú/chat.

[Bài mở đầu](start-here.md) · [Lộ trình](learning-path.md) · [Ôn kiến thức](review-system.md).
