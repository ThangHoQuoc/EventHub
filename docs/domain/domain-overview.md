# Domain: từ sự kiện đến quyền vào cửa

Một vé không chỉ là giá và số lượng. Ban tổ chức công bố chương trình; khách thể hiện ý định mua bằng booking; payment ghi nhận xác nhận tiền; ticket chứng minh quyền tham dự. Tách các khái niệm giúp hệ thống biết khách đang chờ trả tiền hay đã có quyền vào cửa.

![Hành trình mua vé](../assets/diagrams/rendered/purchase.svg)

**ĐÃ XÁC MINH:** Event có organizer, tiêu đề, mô tả, category, location, startAt/endAt và status. TicketType có name/description/price/quantity/soldQuantity và thuộc Event. Booking thuộc customer, gồm BookingItem; mỗi dòng giữ giá và số lượng. Payment gắn booking và reference provider. Ticket gắn booking, loại vé và customer. WaitlistEntry ghi nhu cầu; WaitlistOffer ghi lời mời có expiresAt.

## Ba ranh giới thường nhầm

| Hai khái niệm | Khác nhau vì sao |
|---|---|
| TicketType / Ticket | Một loại vé có thể bán cho nhiều người; một Ticket là một quyền vào cửa cụ thể |
| Booking / Payment | Đặt chưa đồng nghĩa đã trả tiền; hiện pending vẫn chiếm tồn kho |
| WaitlistOffer / Reservation | Offer chưa chiếm chỗ trong code; accept mới thử tạo booking, nên lời mời không bảo đảm còn vé |

Trong working tree, `soldQuantity` có nghĩa vận hành là chỗ đã bị chiếm, không chỉ vé trả tiền. Ví dụ minh họa: quantity=100, 30 chỗ confirmed và 10 chỗ pending thì bộ đếm có thể là 40, available=60. Không thể tách 30/10 chỉ từ TicketType; phải nhìn booking/payment. Chưa có công thức total - sold - reserved vì không có reservedQuantity.

## Những khoảng thiếu domain

Chưa thấy currency/refund/thuế, Venue riêng, seat, vai trò staff check-in, xác minh tiền thực hoặc quy tắc bù khi Event bị hủy sau khi đã bán vé. Enum có CANCELLED ở ticket/entry nhưng chưa chứng minh có luồng vận hành chuyển sang đó. Xem [business rules](business-rules.md) và [lifecycle](lifecycle-and-state-transitions.md).
