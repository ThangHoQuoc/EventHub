import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminNav } from "../components/layout/AdminNav";
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
    <div className="eh-admin-shell">
      <header className="eh-admin-header">
        <div>
          <span className="eh-admin-kicker">
            <LineIcon name="bank" /> Quản trị viên · Đối soát thanh toán
          </span>
          <h1 className="eh-admin-title">Xác nhận giao dịch thanh toán vé</h1>
          <p className="eh-admin-sub">
            Đối soát giao dịch chuyển khoản ngân hàng và kích hoạt phát hành vé tự động cho người mua.
          </p>
        </div>
      </header>

      <AdminNav />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" }}>
        {/* Cột trái: Form nhập đối soát & Danh sách chờ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card Form duyệt thanh toán */}
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "28px 32px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              Duyệt đơn thanh toán thủ công
            </h2>

            <form onSubmit={submit} style={{ display: "grid", gap: "18px" }}>
              <div className="ev-form-group">
                <label htmlFor="adm-booking-id">Mã đơn đặt vé (Booking ID) *</label>
                <input
                  disabled={busy}
                  id="adm-booking-id"
                  name="bookingId"
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Ví dụ: d5d82527-4a0b-426b-a5ef-..."
                  required
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                  value={bookingId}
                />
                <small style={{ color: "var(--eh-text-muted)" }}>
                  Nhập mã đơn được người mua cung cấp trong nội dung chuyển khoản hoặc bấm "Chọn duyệt" từ danh sách bên dưới.
                </small>
              </div>

              <div className="ev-form-grid-2">
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
                  <label htmlFor="adm-ref">Mã tham chiếu ngân hàng (Trace/FT)</label>
                  <input
                    disabled={busy}
                    id="adm-ref"
                    name="reference"
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Tùy chọn: FT263059128..."
                    value={reference}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "12px 16px",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <LineIcon name="alert" /> {error}
                </div>
              )}

              <button
                className="btn btn-primary"
                disabled={busy || !bookingId.trim()}
                style={{
                  justifySelf: "start",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                  fontWeight: "800",
                  padding: "12px 24px",
                  fontSize: "14px",
                }}
                type="submit"
              >
                {busy ? "Đang xử lý đối soát..." : "Xác nhận & Cấp vé ngay"}
              </button>
            </form>

            {payment && (
              <div
                style={{
                  marginTop: "20px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-xl)",
                  padding: "20px",
                  display: "grid",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ color: "#059669", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                  <LineIcon name="check" /> Đã duyệt thành công! Vé điện tử đã được phát hành tự động.
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--eh-text-muted)" }}>Mã đơn:</span>
                  <strong style={{ fontFamily: "monospace" }}>{payment.bookingId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--eh-text-muted)" }}>Số tiền ghi nhận:</span>
                  <strong style={{ color: "#059669", fontSize: "15px" }}>{formatCurrency(payment.amount)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--eh-text-muted)" }}>Trạng thái:</span>
                  <strong>{payment.status} · Đơn: {payment.bookingStatus}</strong>
                </div>
              </div>
            )}
          </section>

          {/* Danh sách đơn hàng PENDING_PAYMENT chờ duyệt */}
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "24px 28px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 2px", color: "var(--eh-text-primary)" }}>
                  Đơn hàng đang chờ đối soát ({pendingBookings.length})
                </h3>
                <small style={{ color: "var(--eh-text-muted)" }}>Các đơn giữ chỗ đang chờ chuyển khoản VietQR</small>
              </div>
              <button
                className="btn btn-secondary"
                disabled={loadingPending}
                onClick={loadPendingBookings}
                style={{ fontSize: "12px", padding: "6px 12px", fontWeight: "700" }}
                type="button"
              >
                <LineIcon name="refresh" /> {loadingPending ? "Đang tải..." : "Làm mới"}
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div style={{ color: "var(--eh-text-muted)", fontSize: "13px", textAlign: "center", padding: "28px 0" }}>
                Hiện không có đơn hàng nào đang chờ thanh toán.
              </div>
            ) : (
              <div className="eh-admin-table-wrap">
                <table className="eh-admin-table" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Tổng tiền</th>
                      <th>Tạo lúc</th>
                      <th style={{ textAlign: "right" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{b.id}</td>
                        <td style={{ fontWeight: "800", color: "#059669" }}>{formatCurrency(b.totalAmount)}</td>
                        <td style={{ color: "var(--eh-text-muted)", fontSize: "12px" }}>{formatDateTime(b.createdAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setBookingId(b.id);
                              window.scrollTo({ top: 120, behavior: "smooth" });
                            }}
                            style={{
                              fontSize: "11px",
                              padding: "4px 10px",
                              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                              fontWeight: "800",
                            }}
                            type="button"
                          >
                            Chọn duyệt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bảng kê lịch sử đối soát trong phiên */}
          {history.length > 0 && (
            <section
              style={{
                background: "var(--eh-surface)",
                padding: "24px 28px",
                borderRadius: "var(--radius-2xl)",
                border: "1px solid var(--eh-border)",
                boxShadow: "var(--eh-shadow-xs)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text-primary)" }}>
                Các giao dịch vừa duyệt trong phiên
              </h3>
              <div className="eh-admin-table-wrap">
                <table className="eh-admin-table" style={{ fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Kênh</th>
                      <th>Mã GD</th>
                      <th style={{ textAlign: "right" }}>Số tiền</th>
                      <th style={{ textAlign: "right" }}>Giờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: "monospace", fontWeight: "700" }}>{item.bookingId.slice(0, 8)}...</td>
                        <td>{item.provider}</td>
                        <td style={{ fontFamily: "monospace" }}>{item.reference}</td>
                        <td style={{ textAlign: "right", fontWeight: "800", color: "#059669" }}>{formatCurrency(item.amount)}</td>
                        <td style={{ textAlign: "right", color: "var(--eh-text-muted)" }}>{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Cột phải: Hướng dẫn quy trình */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "24px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              Quy chuẩn đối soát thanh toán
            </h3>
            <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--eh-text-secondary)", lineHeight: "1.7", display: "grid", gap: "8px" }}>
              <li>Kiểm tra biến động số dư tài khoản ngân hàng của EventHub.</li>
              <li>Đối chiếu số tiền thực nhận với giá trị đơn đặt vé.</li>
              <li>Nhập mã đơn vào form bên cạnh hoặc bấm nút <strong>Chọn duyệt</strong> từ danh sách đơn chờ.</li>
              <li>Hệ thống tự động chuyển trạng thái đơn sang <code>CONFIRMED</code> và kích hoạt xuất vé điện tử kèm mã QR cho khách.</li>
            </ol>
          </section>

          <section
            style={{
              background: "var(--eh-surface)",
              padding: "24px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text-primary)" }}>
              Lối tắt điều hướng
            </h3>
            <div style={{ display: "grid", gap: "10px" }}>
              <Link className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontWeight: "700" }} to="/organizer/dashboard">
                Về Quản lý sự kiện BTC
              </Link>
              <Link className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontWeight: "700" }} to="/organizer/check-in">
                Mở trạm soát vé Check-in
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
