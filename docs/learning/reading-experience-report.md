# Báo cáo cải thiện trải nghiệm đọc

Phạm vi: trình bày `docs/learning/` và tài sản hình; giữ chương trình học, kiến thức,
ví dụ, mục tiêu, câu hỏi và thứ tự module. Không sửa ứng dụng, dependency hoặc test;
không commit/push. Bản đối chiếu SHA256 được chụp trước khi chỉnh sửa lần này để
phân biệt công việc mới với thay đổi chưa commit đã có của người dùng.

## Plugin và cách đọc

IntelliJ IDEA 2025.3, build 253.28294.334, đã nạp Markdown tích hợp. Không cài thêm
plugin trong lần này. Mermaid của JetBrains chưa cài; bản 0.0.26+IJ.252 tương thích.
SVG trong bài có thể đọc ngay bằng Markdown preview. Markdown Navigator Enhanced
đã kiểm tra không tương thích build này.

[Hướng dẫn IntelliJ](reading-in-intellij.md) có thao tác mở Preview, chỉnh cỡ chữ,
Structure, Custom CSS tùy chọn, nguồn JetBrains và cách cài Mermaid chính xác.

## Trình bày đã thay đổi

- 45 bài có liên kết về giáo trình, mục lục module và mục “Trong bài” để nhảy đến
  tình huống, source và luyện tập. Điều hướng “Học tiếp” hiện có được giữ nguyên.
- Chuỗi thao tác dài được chia thành cụm đánh số; đoạn văn dài được ngắt dòng trong
  source; nhãn bài tập được nhấn thay vì in đậm cả đoạn.
- CSS tùy chọn tăng khoảng cách dòng, phân cấp tiêu đề, khoảng cách bảng/code và
  phần đáp án thu gọn. Markdown vẫn sử dụng được khi không bật CSS.
- Hình dùng canvas 880px, chữ nội dung 20–22px, nhãn vai trò và nhánh rõ ràng. Khi
  preview rộng 720px, chữ nội dung tương đương khoảng 16–18px.

## Rà soát toàn bộ hình đang được sử dụng

Ban đầu có 26 hình khác nhau trong giáo trình: 16 hình cơ chế và 10 hình từ bộ tài
liệu hệ thống. Không có PNG hoặc hình stock cần thay. Kết quả:

| Nhóm | Xử lý | Lý do |
|---|---|---|
| 16 hình cơ chế | Dựng lại bố cục, giữ dữ liệu nguồn `figures.json` | Tăng cỡ chữ; bảng và so sánh gọn hơn; làm rõ hướng đọc |
| Tổng quan mua vé và trace User | Giữ nguyên | Đủ rõ cho mục tiêu tổng quan và ranh giới module |
| 8 trace module còn lại | Thay chỗ nhúng bằng 13 SVG tập trung | Thể hiện điều kiện, nhánh và tương tác cụ thể; tránh một hình quá rộng |

| Module | Góc nhìn mới |
|---|---|
| Auth | Sequence login; flow Bearer/filter và kết quả authentication |
| Event | Guard publish theo thứ tự implementation |
| Ticket | Tạo TicketType: quyền, DRAFT, trùng tên và lưu |
| Booking | Kiểm tra đầu vào; sequence reserve có điều kiện và lưu trong transaction |
| Payment | Replay theo provider/reference; sequence lưu payment và phát vé |
| Ticketing | Phát hành theo quantity; check-in theo code, quyền và trạng thái |
| Waitlist | Replay/deadline/accept; sequence gọi Booking trong transaction hiện có |
| Common/config | Điểm chặn request và handler tương ứng |

Các hình phân biệt hành vi hiện tại với giới hạn: offer chưa reserve, exception có
thể rollback nhánh expire, save chưa chứng minh commit, check-in chưa có lock/version.
Hình race giữ cách diễn đạt khả năng cần test, không khẳng định đã tái hiện runtime.

Tài sản hệ thống cũ được giữ vì tài liệu khác còn sử dụng. Giáo trình hiện nhúng 29
SVG học tập cùng hai hình tổng quan cũ. [Danh mục hình và căn cứ Java](assets/README.md)
liên kết từng SVG, Mermaid và source implementation.

## File được sửa/tạo

- 44 bài đánh số trong [modules](modules/README.md) và [start-here.md](start-here.md):
  trình bày/điều hướng; tám bài `01-bai-toan.md` đổi hình nhúng.
- [README](README.md): thêm liên kết hướng dẫn preview.
- [Hướng dẫn đọc](reading-in-intellij.md), báo cáo này và
  [handbook.css](assets/preview/handbook.css): file mới.
- [assets/README](assets/README.md): danh mục hình, nguồn và cách dựng/kiểm tra.
- [flows.json](assets/sources/flows.json), [layout.py](assets/sources/layout.py),
  13 `.mmd` và 13 SVG mới; 16 SVG có sẵn được dựng lại.
- [render.py](assets/sources/render.py), [verify.py](assets/sources/verify.py):
  dựng SVG/Mermaid từ cùng JSON, kiểm tra đồng bộ và đường dẫn căn cứ.

Không xóa tài sản cũ. `figures.json`, lộ trình và manifest bài học được giữ nguyên.
SVG được dựng trực tiếp từ JSON bằng Python standard library; `.mmd` là bản xuất
Mermaid có thể chỉnh sửa thông qua cùng nguồn JSON, không phải ảnh render từ Mermaid.

## Kiểm tra và giới hạn

- Script kiểm tra toàn bộ link nội bộ/anchor, cấu trúc 45 bài, 26 trích đoạn nguyên
  văn và số dòng source; đối chiếu 29 SVG và 13 Mermaid với nguồn JSON.
- Đối chiếu 45 bài với bản trước: các từ nội dung gốc vẫn xuất hiện theo thứ tự gốc;
  code block được kiểm tra riêng, không thay nội dung. Lộ trình/manifest không đổi.
- Render 29 SVG trong Chrome ở chiều rộng 720px; đo bounding box chữ so với ô chứa
  và canvas. Đã sửa mã lỗi dài bị tràn; lần đo cuối không còn chữ tràn khung.
- Quan sát ảnh của cả 29 hình; render Markdown đại diện ở chế độ mặc định, CSS tùy
  chọn sáng và tối. Kiểm tra trong trình duyệt sử dụng Markdown parser và CSS mặc
  định lấy từ bản cài IDEA, không tương đương kiểm tra trực tiếp JCEF trong IDE.
- Đối chiếu SHA256 toàn workspace với bản trước: không có thay đổi ngoài
  `docs/learning/`. Git vẫn giữ các thay đổi ứng dụng đã có trước nhiệm vụ.

**Chưa xác minh:** cửa sổ Markdown preview thực tế trong IntelliJ và rendering của
Mermaid plugin. Không có điều khiển native IDE; không đóng IDE đang mở để cài bằng
dòng lệnh. Không chạy test/backend/frontend vì nhiệm vụ chỉ thay tài liệu.

Lệnh kiểm tra lại:

```powershell
python docs/learning/assets/sources/render.py
python docs/learning/assets/sources/verify.py
```
