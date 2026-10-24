# Sơ đồ có source chỉnh sửa được

Nguồn ở [diagrams.json](sources/diagrams.json), bộ render ở [render.py](sources/render.py); SVG trong `rendered/`. Dùng Python standard library, không cài dependency. SVG có title/description và text thật, phóng to được; màu xanh là xử lý, xanh lá là dữ liệu/trạng thái kết quả, vàng là điều kiện, đỏ là giới hạn/rủi ro.

Từ gốc repo chạy:

```powershell
python docs/assets/diagrams/sources/render.py
```

Sửa dữ liệu/nhãn/bố cục trong JSON rồi render, không sửa SVG một mình. Mỗi hình có source-of-truth trong JSON; render lại phải cho cùng nội dung. Không vẽ thành phần đề xuất như hiện trạng.

| SVG | Nội dung | Nơi dùng |
|---|---|---|
| [context](rendered/context.svg) | Actor/backend/PostgreSQL | system-context |
| [modules](rendered/modules.svg) | Phụ thuộc module đáng chú ý | module-index |
| [request](rendered/request.svg) | Filter→MVC→service→persistence | architecture, common/config |
| [purchase](rendered/purchase.svg) | Đặt→confirm→vé→check-in | major-flows, domain |
| [states](rendered/states.svg) | Các cạnh chuyển trạng thái có thật | lifecycle |
| [entities](rendered/entities.svg) | ER dưới dạng từng quan hệ và bội số | entity-relationships |
| [inventory](rendered/inventory.svg) | Counter/reserve/release | transaction/data integrity |
| [auth](rendered/auth.svg) | Login/request JWT | security, bài auth |
| [user](rendered/user.svg) | Context→User→DTO | bài user |
| [event](rendered/event.svg) | Publish với guard | bài event |
| [ticket](rendered/ticket.svg) | Tạo loại vé DRAFT | bài ticket |
| [booking](rendered/booking.svg) | Gộp/validate/giá/reserve/save | bài booking |
| [payment](rendered/payment.svg) | Replay/confirm/issue | bài payment |
| [ticketing](rendered/ticketing.svg) | Phát và check-in | bài ticketing |
| [waitlist](rendered/waitlist.svg) | Accept/booking/convert | bài waitlist |

ER biểu diễn từng quan hệ trên một dòng để tránh chồng đường. Nhãn FK ở giữa, phía cha ở trái và phía con bên phải. Những luồng có nhánh được giải thích ngay trong bài; hình chọn nhánh đại diện và ghi guard/terminal. Kiểm chứng source/render/link và xem hình nằm trong [biên bản](../../project/verification.md).
