import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { confirmPaymentApi, type PaymentDto } from "../api/payments";
import { getPendingBookingsApi, type BookingDto } from "../api/booking";
import { formatCurrency, formatDateTime } from "../utils/format";
import { LineIcon } from "../components/ui/LineIcon";

interface ReconciledItem {
  bookingId: string;
  provider: string;
  reference: string;
  amount: number;
  time: string;
}

export function AdminPaymentPage() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentDto>();
  const [history, setHistory] = useState<ReconciledItem[]>([]);

  // Pending bookings state
  const [pendingBookings, setPendingBookings] = useState<BookingDto[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Form states
  const [bookingId, setBookingId] = useState("");
  const [provider, setProvider] = useState("MANUAL_TRANSFER");
  const [reference, setReference] = useState("");

  async function loadPendingBookings() {
    setLoadingPending(true);
    try {
      const res = await getPendingBookingsApi({ page: 0, size: 10 });
      setPendingBookings(res.content || []);
    } catch {
      // Bỏ qua lỗi nếu không phải role ADMIN hoặc network tạm thời
    } finally {
      setLoadingPending(false);
    }
  }

  useEffect(() => {
    loadPendingBookings();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    if (!window.confirm(`Xác nhận duyệt thanh toán cho đơn: ${bookingId}?`)) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setPayment(undefined);

    try {
      const res = await confirmPaymentApi({
        bookingId: bookingId.trim(),
        provider: provider.trim(),
        providerTransactionId: reference.trim() || `TXN-${Date.now().toString().slice(-6)}`,
      });
      setPayment(res);
      setHistory((prev) => [
        {
          bookingId: res.bookingId,
          provider: res.provider,
          reference: res.providerTransactionId,
          amount: res.amount,
          time: new Date().toLocaleTimeString("vi-VN"),
        },
        ...prev,
      ]);
      setBookingId("");
      setReference("");
      loadPendingBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xác nhận thanh toán.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="ev-editorial-page" style={{ padding: "40px 32px 80px", maxWidth: "1180px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px" }}>
        <span className="ev-eyebrow">
          <LineIcon name="bank" /> Quản trị viên · Đối soát thanh toán
        </span>
        <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0 8px", color: "var(--eh-text)" }}>
          Xác nhận giao dịch thanh toán vé
        </h1>
        <p style={{ color: "var(--eh-muted)", fontSize: "14px", margin: 0 }}>
          Đối soát giao dịch chuyển khoản ngân hàng và kích hoạt phát hành vé tự động cho người mua.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px", alignItems: "start" }}>
        {/* Cột trái: Form nhập đối soát & Danh sách chờ */}
        <div style={{ display: "grid", gap: "24px" }}>
          <section className="checkout-form-card" style={{ background: "var(--eh-surface)", padding: "28px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px", color: "var(--eh-text)" }}>
              Duyệt đơn thanh toán thủ công
            </h2>

            <form onSubmit={submit} style={{ display: "grid", gap: "16px" }}>
              <div className="ev-form-group">
                <label htmlFor="adm-booking-id">Mã đơn đặt vé (Booking ID)</label>
                <input
                  disabled={busy}
                  id="adm-booking-id"
                  name="bookingId"
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Ví dụ: 8f3k-9281 hoặc d5d82527-..."
                  required
                  value={bookingId}
                />
                <small>Nhập chính xác mã đơn được người mua cung cấp trong nội dung chuyển khoản hoặc chọn từ danh sách bên dưới.</small>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="ev-form-group">
                  <label htmlFor="adm-provider">Kênh thanh toán</label>
                  <select
                    disabled={busy}
                    id="adm-provider"
                    name="provider"
                    onChange={(e) => setProvider(e.target.value)}
                    value={provider}
                  >
                    <option value="MANUAL_TRANSFER">Chuyển khoản VietQR / 247</option>
                    <option value="VNPAY">VNPay Sandbox</option>
                    <option value="MOMO">MoMo QR</option>
                  </select>
                </div>

                <div className="ev-form-group">
                  <label htmlFor="adm-ref">Mã tham chiếu ngân hàng</label>
                  <input
                    disabled={busy}
                    id="adm-ref"
                    name="reference"
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Tùy chọn: Mã FT/Trace..."
                    value={reference}
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: "var(--eh-red)", fontSize: "13px", padding: "10px", background: "var(--eh-red-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-red-100)" }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" disabled={busy || !bookingId.trim()} style={{ justifySelf: "start" }} type="submit">
                {busy ? "Đang xử lý đối soát..." : "Xác nhận & Cấp vé ngay"}
              </button>
            </form>

            {payment && (
              <div
                style={{
                  marginTop: "20px",
                  background: "var(--eh-green-50)",
                  border: "1px solid var(--eh-green-100)",
                  borderRadius: "var(--radius-lg)",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <div style={{ color: "var(--eh-green)", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  <LineIcon name="check" /> Đã duyệt thành công! Vé đã được phát hành tự động.
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mã đơn:</span>
                  <strong style={{ fontFamily: "monospace" }}>{payment.bookingId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Số tiền:</span>
                  <strong style={{ color: "var(--eh-green)" }}>{formatCurrency(payment.amount)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Trạng thái:</span>
                  <strong>{payment.status} · Đơn: {payment.bookingStatus}</strong>
                </div>
              </div>
            )}
          </section>

          {/* Danh sách đơn hàng PENDING_PAYMENT chờ duyệt */}
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0, color: "var(--eh-text)" }}>
                Đơn hàng đang chờ đối soát ({pendingBookings.length})
              </h3>
              <button
                className="btn btn-secondary"
                disabled={loadingPending}
                onClick={loadPendingBookings}
                style={{ fontSize: "12px", padding: "4px 10px" }}
                type="button"
              >
                {loadingPending ? "Đang tải..." : "Làm mới"}
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div style={{ color: "var(--eh-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                Hiện không có đơn hàng nào đang chờ thanh toán.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--eh-border)", color: "var(--eh-muted)", textAlign: "left" }}>
                    <th style={{ padding: "8px 6px" }}>Mã đơn</th>
                    <th style={{ padding: "8px 6px" }}>Tổng tiền</th>
                    <th style={{ padding: "8px 6px" }}>Tạo lúc</th>
                    <th style={{ padding: "8px 6px", textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid var(--eh-border)" }}>
                      <td style={{ padding: "10px 6px", fontFamily: "monospace", fontWeight: "600" }}>{b.id}</td>
                      <td style={{ padding: "10px 6px", fontWeight: "700", color: "var(--eh-green)" }}>{formatCurrency(b.totalAmount)}</td>
                      <td style={{ padding: "10px 6px", color: "var(--eh-muted)" }}>{formatDateTime(b.createdAt)}</td>
                      <td style={{ padding: "10px 6px", textAlign: "right" }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setBookingId(b.id);
                            window.scrollTo({ top: 150, behavior: "smooth" });
                          }}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                          type="button"
                        >
                          Chọn duyệt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Bảng kê lịch sử đối soát trong phiên */}
          {history.length > 0 && (
            <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
                Các giao dịch vừa duyệt trong phiên
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--eh-border)", color: "var(--eh-muted)", textAlign: "left" }}>
                    <th style={{ padding: "8px 6px" }}>Mã đơn</th>
                    <th style={{ padding: "8px 6px" }}>Kênh</th>
                    <th style={{ padding: "8px 6px" }}>Mã GD</th>
                    <th style={{ padding: "8px 6px" }}>Số tiền</th>
                    <th style={{ padding: "8px 6px" }}>Giờ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--eh-border)" }}>
                      <td style={{ padding: "10px 6px", fontFamily: "monospace" }}>{item.bookingId.slice(0, 8)}...</td>
                      <td style={{ padding: "10px 6px" }}>{item.provider}</td>
                      <td style={{ padding: "10px 6px", fontFamily: "monospace" }}>{item.reference}</td>
                      <td style={{ padding: "10px 6px", fontWeight: "700", color: "var(--eh-green)" }}>{formatCurrency(item.amount)}</td>
                      <td style={{ padding: "10px 6px", color: "var(--eh-muted)" }}>{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        {/* Cột phải: Hướng dẫn quy trình */}
        <aside style={{ display: "grid", gap: "20px" }}>
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
              Quy chuẩn đối soát
            </h3>
            <ol style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--eh-muted)", lineHeight: "1.7", display: "grid", gap: "6px" }}>
              <li>Kiểm tra biến động số dư tài khoản ngân hàng của EventHub.</li>
              <li>Đối chiếu số tiền thực nhận với giá trị đơn đặt vé.</li>
              <li>Nhập mã đơn vào form bên cạnh hoặc bấm nút <strong>Chọn duyệt</strong> từ danh sách đơn chờ.</li>
              <li>Hệ thống tự động chuyển trạng thái đơn sang <code>CONFIRMED</code> và sinh vé kèm mã QR cho khách.</li>
            </ol>
          </section>

          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
              Điều hướng nhanh
            </h3>
            <div style={{ display: "grid", gap: "8px" }}>
              <Link className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} to="/organizer/dashboard">
                Về Quản lý sự kiện
              </Link>
              <Link className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} to="/organizer/check-in">
                Mở trạm soát vé Check-in
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
