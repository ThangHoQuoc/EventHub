# Đọc giáo trình trong IntelliJ IDEA

[Giáo trình](README.md) · [Bắt đầu học](start-here.md)

## Mở bài và chỉnh preview

1. Mở [Bài mở đầu](start-here.md). Trên góc phải của editor Markdown, chọn **Preview**
   để dành toàn bộ chiều rộng cho bài; chọn **Editor and Preview** khi cần sửa Markdown.
2. Nhấn **Ctrl+Alt+S → Languages & Frameworks → Markdown**. Trong phần **Preview**,
   thử cỡ chữ **18** rồi điều chỉnh theo màn hình của bạn.
3. Dùng **Alt+7** mở Structure hoặc **Ctrl+F12** xem danh sách tiêu đề. Đầu mỗi bài có
   liên kết “Trong bài”; cuối bài có “Học tiếp”.
4. Với hình nhiều bước, dành khoảng **720px trở lên** cho preview. Hình SVG phóng to
   vẫn rõ; trên cửa sổ hẹp, chuyển sang Preview thay vì chia đôi editor.

Các thao tác trên dựa vào [hướng dẫn Markdown của IntelliJ IDEA 2025.3](https://www.jetbrains.com/help/idea/2025.3/markdown.html).
Không cần cài plugin mới để đọc các hình SVG được nhúng trong bài.

## Plugin đã kiểm tra trên máy

Kiểm tra ngày 09/10/2026: IntelliJ IDEA **2025.3**, build **253.28294.334**.
Thông tin phiên bản lấy từ bản cài đặt; log IDE ghi nhận Markdown và JCEF preview đã nạp.

| Thành phần | Kết quả | Việc cần làm |
|---|---|---|
| Markdown, JetBrains (`org.intellij.plugins.markdown`) | Có sẵn, đã nạp; phiên bản 253.28294.334 | Dùng preview tích hợp |
| [Mermaid, JetBrains](https://plugins.jetbrains.com/plugin/20146-mermaid) (`com.intellij.mermaid`) | Chưa cài; bản **0.0.26+IJ.252** hỗ trợ build hiện tại | Chỉ cần cài khi muốn xem/sửa Mermaid source |
| [Markdown Navigator Enhanced](https://plugins.jetbrains.com/plugin/7896-markdown-navigator-enhanced) | Bản mới nhất đã kiểm tra là 3.0.213.150, giới hạn đến build 231.8770.65 | Không phù hợp build 253 hiện tại |
| Plugin SVG/Markdown khác | Chưa thấy nhu cầu bổ sung | Dùng Markdown tích hợp và SVG hiện có |

Tính tương thích Mermaid được đối chiếu với
[danh sách chính thức dành cho build IU-253.28294.334](https://plugins.jetbrains.com/plugins/list?pluginId=20146&build=IU-253.28294.334).
Bản tương thích có giới hạn **251.23774–261.***; không chọn bản dành cho build 263.

**Cài Mermaid thủ công nếu cần:** Ctrl+Alt+S → Plugins → Marketplace → tìm **Mermaid**,
chọn nhà phát hành **JetBrains**, kiểm tra plugin ID `com.intellij.mermaid`, rồi Install.
IDE phải chọn bản tương thích; nếu báo không tương thích, dừng và kiểm tra phiên bản
trong trang Marketplace, không tải bản mới nhất tùy ý. Khởi động lại khi IDE yêu cầu.

Chưa cài plugin trong lần chỉnh tài liệu này: IntelliJ đang mở và môi trường không có
điều khiển cửa sổ IDE. [Hướng dẫn JetBrains](https://www.jetbrains.com/help/idea/2025.3/managing-plugins.html)
yêu cầu đóng IDE trước khi cài bằng dòng lệnh; người học chủ động cài qua Settings ở trên.

## Kiểu chữ tùy chọn

Markdown tiêu chuẩn đã có đầy đủ bố cục, liên kết và hình ảnh. Nếu muốn tăng khoảng
cách dòng, trong trang Settings Markdown mở **Custom CSS → Load from** và chọn
[handbook.css](assets/preview/handbook.css). Không cần JavaScript hoặc website riêng.
CSS chỉ thay đổi cách hiển thị; có thể bỏ chọn để trở lại kiểu mặc định.

## Thứ tự đọc mỗi buổi

Mở README của module → đọc bài theo số → tự trả lời câu hỏi → mở phần giải thích →
làm bài tập → bấm “Học tiếp”. Giữ nguyên [lộ trình học](learning-path.md).
Chưa cần mở các file `.mmd`, JSON hay bộ dựng hình để học backend.

**Giới hạn kiểm tra:** đã kiểm tra SVG và Markdown bằng trình duyệt, liên kết và nguồn
trích dẫn bằng script. Chưa quan sát trực tiếp preview trong cửa sổ IntelliJ hoặc chạy
Mermaid plugin trên IDE; thông tin plugin dựa trên bản cài đặt, log và Marketplace.
