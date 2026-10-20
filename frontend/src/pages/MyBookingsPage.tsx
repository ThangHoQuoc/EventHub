import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../components/customer/CustomerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockCustomerBookings } from "../data/mockCustomer";
import { mockEvents } from "../data/mockEvents";
import { formatCurrency, formatDate } from "../utils/format";
import { cancelBookingApi, getMyBookingsApi, type BookingDto } from "../api/booking";
import { useAuth } from "../context/AuthContext";
import type { CustomerBooking } from "../types/customer";

export function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CustomerBooking[]>(mockCustomerBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");

  const fetchBookings = () => {
    if (!user) return;
    getMyBookingsApi({ size: 20 })
      .then((res) => {
        if (res.content && res.content.length > 0) {
          const mapped: CustomerBooking[] = res.content.map((b: BookingDto) => {
            const firstItem = b.items && b.items[0];
            const totalQty = b.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;
            const matchedEvent = mockEvents.find((e) => e.id === firstItem?.eventId) || {
              ...mockEvents[0],
              id: firstItem?.eventId || mockEvents[0].id,
              title: firstItem?.eventTitle || mockEvents[0].title,
            };

            return {
              id: b.id,
              bookingCode: `BK-${b.id.substring(0, 6).toUpperCase()}`,
              event: matchedEvent,
              ticketTypeName: firstItem?.ticketTypeName || "Vé tiêu chuẩn",
              quantity: totalQty,
              ticketsCount: totalQty,
              totalAmount: Number(b.totalAmount) || 0,
              status: b.status === "PAID" ? "CONFIRMED" : b.status === "PENDING" ? "PENDING" : "CANCELLED",
              createdAt: b.createdAt,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            };
          });
          setBookings(mapped);
        }
      })
      .catch(() => {
        // Fallback to mock
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  async function handleCancelBooking(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn giữ chỗ này để trả vé về hệ thống?")) return;
    setCancellingId(id);
    setCancelError("");

    try {
      await cancelBookingApi(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể hủy đơn đặt chỗ.";
      setCancelError(msg);
      // Fallback local update if mock
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <CustomerLayout
      activeNav="bookings"
      description="Xem trạng thái các đơn đặt chỗ, thanh toán hoặc hủy đơn giữ chỗ còn hiệu lực."
      title="Đơn hàng & Giữ chỗ"
    >
      <div className="ev-bookings-table-wrap">
        <table className="ev-bookings-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Sự kiện & Hạng vé</th>
              <th>Ngày đặt</th>
              <th>Số lượng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const isConfirmed = booking.status === "CONFIRMED";
              const isPending = booking.status === "PENDING";
              const isCancelled = booking.status === "CANCELLED";

              return (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.bookingCode}</strong>
                  </td>
                  <td>
                    <div className="ev-booking-event-col">
                      <Link to={`/events/${booking.event.id}`}>
                        {booking.event.title}
                      </Link>
                      <small>{booking.ticketTypeName}</small>
                    </div>
                  </td>
                  <td>
                    <span>{formatDate(booking.createdAt)}</span>
                  </td>
                  <td>
                    <span>{booking.quantity} vé</span>
                  </td>
                  <td>
                    <strong>{formatCurrency(booking.totalAmount)}</strong>
                  </td>
                  <td>
                    <span
                      className={`ev-booking-status-badge status-${booking.status.toLowerCase()}`}
                    >
                      <i />
                      {isConfirmed
                        ? "Đã thanh toán"
                        : isPending
                        ? "Đang chờ thanh toán"
                        : isCancelled
                        ? "Đã hủy"
                        : "Hết hạn"}
                    </span>
                  </td>
                  <td>
                    <div className="ev-booking-actions">
                      {isConfirmed && (
                        <Link className="ev-action-link" to="/my-tickets">
                          Xem vé
                        </Link>
                      )}
                      {isPending && (
                        <>
                          <Link
                            className="ev-action-btn-pay"
                            to="/payment?method=vnpay"
                          >
                            Thanh toán ngay
                          </Link>
                          <button
                            className="ev-action-btn-cancel"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            type="button"
                          >
                            {cancellingId === booking.id ? "Đang hủy..." : "Hủy đơn"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ev-bookings-helper">
        <LineIcon name="info" />
        <span>
          Đơn hàng ở trạng thái <strong>Đang chờ thanh toán</strong> sẽ tự động được giải phóng vé sau 10 phút nếu chưa hoàn tất chuyển khoản.
        </span>
      </div>
    </CustomerLayout>
  );
}
