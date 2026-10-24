# Ôn bằng cách gọi kiến thức ra

Bạn nhớ lại trước, rồi mới đọc để sửa. Nhìn thấy lời giải quen thuộc chưa phải tự giải thích được.

## Lịch gợi ý linh hoạt

| Lúc nào | Làm gì trong 3–5 phút | Khi chưa trả lời được |
|---|---|---|
| Cuối buổi | Đóng bài, trả lời câu hỏi trung tâm | Xem đúng phần cơ chế, viết lại bằng lời mình |
| Buổi sau, thường ngày kế | Vẽ flow hoặc tính biến thể không xem | Dùng gợi ý, không đọc lại toàn bài |
| Sau vài ngày, khoảng ngày 3–4 | Đổi input/state/caller; trace failure path | Quay prerequisite hoặc ví dụ đã giải |
| Khoảng một tuần | Làm một bài debug/test và nối với module mới | Ghi khoảng thiếu bằng chứng, chọn test đúng tầng |
| Sau 2–4 tuần hoặc trước dùng lại | Thiết kế use case nhỏ độc lập | Ôn đúng cơ chế còn yếu, không học lại mọi module |

Đây là nhịp tham khảo, không phải công thức bảo đảm ghi nhớ. Nếu nghỉ học, bắt đầu bằng một câu cũ; không cần “bù” hàng chục bài ôn. Không có lịch nhắc tự động được tạo.

## Chọn bài cần ôn bằng kết quả

Tự chấm một câu 0/1/2: 0 chưa nói được; 1 đúng ý nhưng thiếu trace/bằng chứng; 2 tự giải thích và dự đoán được biến thể. Ưu tiên câu 0, sau đó câu 1. Nếu hai buổi liên tiếp đạt 2, giãn lần ôn. Nếu sai invariant, quay ví dụ ngay.

Mỗi module chỉ giữ 3–5 câu đang khó trong sổ, không tạo hàng trăm flashcard mới. Câu tốt có dữ liệu và yêu cầu suy luận: “sold=5, B giữ2; cancel/expire cùng đọc pending thì lock type đủ chưa?” Câu chỉ hỏi “@Transactional là gì?” ít giúp trace hơn.

## Bộ câu nối các module

Tự trả lời trước, sau đó mở bài được dẫn để đối chiếu:

1. Auth/User: role claim ADMIN nhưng DB CUSTOMER thì authority nào được dùng? [Auth bài 3](modules/auth/03-co-che.md).
2. Event/Ticket: có quyền ORGANIZER nhưng event người khác hoặc PUBLISHED thì cấu hình type được không? [Ticket bài 2](modules/ticket/02-co-che.md).
3. Ticket/Booking: sold null được mapper và booking hiểu giống nhau không? [Ticket bài 3](modules/ticket/03-co-che.md).
4. Booking/Payment: reserve đã commit, phát vé lỗi trong confirm thì counter nào rollback? [Payment bài 3](modules/payment/03-co-che.md).
5. Payment/Ticketing: unique key hoặc trạng thái USED cuối có chứng minh chỉ một hiệu ứng không? [Payment bài 2](modules/payment/02-co-che.md), [Ticketing bài 3](modules/ticketing/03-co-che.md).
6. Booking/Waitlist: offer còn hạn, chỗ cuối bị khách khác giữ thì accept ra sao? [Waitlist bài 3](modules/waitlist/03-co-che.md).
7. Waitlist/Common: save(EXPIRED) rồi throw khác job expire return bình thường thế nào? [Waitlist bài 4](modules/waitlist/04-co-che.md).
8. User/Common: scheduler có thể gọi current user helper như HTTP request không? [Common bài 4](modules/common-config/04-co-che.md).

<details>
<summary>Đáp án ngắn để kiểm sau khi đã trả lời</summary>

1. ROLE_CUSTOMER từ DB nếu User ACTIVE.
2. Role không bỏ qua ownership; CRUD TicketType yêu cầu DRAFT, ADMIN cũng chịu state guard.
3. Mapper trả null; booking coi sold null là 0.
4. Nhóm confirm booking/payment/tickets rollback; reservation đã commit từ create vẫn giữ.
5. Không: cần bảo vệ transition và kiểm kết quả các caller, không chỉ state cuối.
6. createBooking có thể lỗi hết chỗ; accept không chuyển converted khi rollback.
7. RuntimeException có thể rollback save; job thành công có đường commit riêng.
8. Không có Authentication HTTP mặc định ở job; helper trực tiếp có thể lỗi.

</details>

## Trước khi làm feature mới

Tự viết actor, invariant và một test thất bại trước khi nhờ AI góp ý. Dùng bài cuối module làm rubric: expected rõ, trace đúng, tầng test phù hợp, có trade-off. Bạn sẵn sàng khi tự sửa một lời giải sai và giải thích được lý do, không cần thuộc từng dòng source.

[Quay lại lộ trình](learning-path.md) · [Cách học](how-to-study.md).
