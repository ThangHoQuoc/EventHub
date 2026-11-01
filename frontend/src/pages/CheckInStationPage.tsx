import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { checkInTicketApi } from "../api/organizer";
import type { TicketDto } from "../api/tickets";
import { formatDateTime } from "../utils/format";

interface ScanLog {
  code: string;
  time: string;
  success: boolean;
  message: string;
}

export function CheckInStationPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState<TicketDto>();
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [cameraActive, setCameraActive] = useState(true);
  const lock = useRef(false);

  async function performCheckIn(rawCode: string) {
    const code = rawCode.trim();
    if (!code || lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setResult(undefined);

    const now = new Date().toLocaleTimeString("vi-VN");

    try {
      const payload = code.includes(":") ? { qrPayload: code } : { ticketCode: code };
      const res = await checkInTicketApi(payload);
      setResult(res);
      setTicketCode("");
      setLogs((prev) => [
        {
          code: res.ticketCode,
          time: now,
          success: true,
          message: `Hợp lệ: ${res.ticketTypeName || "Vé sự kiện"}`,
        },
        ...prev,
      ]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Mã vé không hợp lệ hoặc đã qua cửa.";
      setError(errMsg);
      setLogs((prev) => [
        {
          code: code,
          time: now,
          success: false,
          message: errMsg,
        },
        ...prev,
      ]);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCheckIn(ticketCode);
  }

  function handleDemoScan() {
    performCheckIn("EH-DEMO-98214");
  }

  const successCount = logs.filter((l) => l.success).length;

  return (
    <OrganizerLayout
      activeNav="checkin"
      description="Trạm soát vé trực tiếp tại cửa sự kiện: Quét camera mã QR Code hoặc nhập mã vé để xác thực khách vào cửa thời gian thực."
      title="Trạm soát vé Check-in trực tiếp"
    >
      <div className="eh-checkin-layout">
        {/* Cột trái: Máy quét & Kết quả */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Khung máy quét Laser Scanner Mockup */}
          <section aria-label="Kính ngắm quét mã vé" className="eh-checkin-scanner-box">
            {/* Viewfinder kính quét */}
            <div className="eh-scanner-viewfinder">
              {/* 4 góc viền laser neon */}
              <div className="eh-viewfinder-corner eh-corner-tl" />
              <div className="eh-viewfinder-corner eh-corner-tr" />
              <div className="eh-viewfinder-corner eh-corner-bl" />
              <div className="eh-viewfinder-corner eh-corner-br" />

              {/* Tia laser quét chuyển động */}
              {cameraActive && <div className="eh-scanner-laser" />}

              <div className="eh-scanner-status-text">
                <LineIcon name="search" />
                <p style={{ margin: 0 }}>
                  {cameraActive
                    ? "Kính quét Laser sẵn sàng · Đang đợi mã QR"
                    : "Camera đang tạm dừng"}
                </p>
                <small style={{ color: "rgba(255,255,255,0.4)", display: "block", marginTop: "4px" }}>
                  Minh họa luồng camera · chưa tích hợp webcam trực tiếp
                </small>
              </div>
            </div>

            <div style={{ marginTop: "22px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCameraActive(!cameraActive)}
                style={{
                  fontSize: "12px",
                  minHeight: "36px",
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  fontWeight: "700",
                }}
                type="button"
              >
                {cameraActive ? "Tạm dừng camera" : "Bật camera quét"}
              </button>
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={handleDemoScan}
                style={{
                  fontSize: "12px",
                  minHeight: "36px",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                  fontWeight: "800",
                }}
                type="button"
              >
                <LineIcon name="sparkles" /> Thử quét mã mẫu
              </button>
            </div>
          </section>

          {/* Form nhập mã vé thủ công */}
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "24px 28px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              Hoặc nhập mã vé / chuỗi QR thủ công
            </h3>

            <form onSubmit={submit} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                disabled={busy}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Nhập mã vé (ví dụ: EH-INDIE-47120) hoặc dán toàn bộ chuỗi QR..."
                required
                style={{
                  flex: "1 1 280px",
                  height: "46px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--eh-border)",
                  padding: "0 16px",
                  fontSize: "13px",
                  background: "#ffffff",
                }}
                value={ticketCode}
              />
              <button
                className="btn btn-primary"
                disabled={busy || !ticketCode.trim()}
                style={{
                  height: "46px",
                  padding: "0 24px",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                  fontSize: "13px",
                  fontWeight: "800",
                }}
                type="submit"
              >
                {busy ? "Đang xác thực..." : "Check-in ngay"}
              </button>
            </form>
          </section>

          {/* Màn hình kết quả Check-in Hợp lệ */}
          {result && (
            <section className="eh-checkin-result-card">
              <div className="eh-result-head">
                <div className="eh-result-icon">
                  <LineIcon name="check" />
                </div>
                <div>
                  <h3 className="eh-result-title">XÁC THỰC CHECK-IN THÀNH CÔNG!</h3>
                  <p className="eh-result-sub">Vé chính chủ hợp lệ · Khách đã được phép qua cổng</p>
                </div>
              </div>

              <div className="eh-result-meta-grid">
                <div className="eh-meta-item">
                  <small>Mã số vé</small>
                  <strong style={{ fontFamily: "monospace", color: "var(--eh-brand-dark)" }}>{result.ticketCode}</strong>
                </div>
                <div className="eh-meta-item">
                  <small>Trạng thái</small>
                  <strong style={{ color: "#059669" }}>{result.status}</strong>
                </div>
                <div className="eh-meta-item">
                  <small>Thời gian quét vào</small>
                  <strong>{result.checkedInAt ? formatDateTime(result.checkedInAt) : "Vừa xác thực"}</strong>
                </div>
                <div className="eh-meta-item">
                  <small>Hạng vé</small>
                  <strong>{result.ticketTypeName || "Vé sự kiện"}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Màn hình kết quả Check-in Không Hợp Lệ */}
          {error && (
            <section className="eh-checkin-error-card">
              <div className="eh-error-icon">
                <LineIcon name="alert" />
              </div>
              <div>
                <strong style={{ fontSize: "17px", fontWeight: "900", color: "#991b1b", display: "block", marginBottom: "4px" }}>
                  CHECK-IN KHÔNG HỢP LỆ!
                </strong>
                <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", fontWeight: "600" }}>{error}</p>
              </div>
            </section>
          )}
        </div>

        {/* Cột phải: Thống kê ca trực & Bảng Log */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Thống kê ca trực */}
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "22px 24px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 16px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              Thống kê ca trực soát vé
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  padding: "16px",
                  borderRadius: "var(--radius-xl)",
                }}
              >
                <strong style={{ fontSize: "26px", color: "#059669", display: "block", fontWeight: "900" }}>
                  {successCount}
                </strong>
                <small style={{ fontSize: "11px", color: "#047857", fontWeight: "700", textTransform: "uppercase" }}>
                  Hợp lệ vào cửa
                </small>
              </div>

              <div
                style={{
                  background: "var(--eh-surface-alt)",
                  border: "1px solid var(--eh-border)",
                  padding: "16px",
                  borderRadius: "var(--radius-xl)",
                }}
              >
                <strong style={{ fontSize: "26px", color: "var(--eh-text-primary)", display: "block", fontWeight: "900" }}>
                  {logs.length}
                </strong>
                <small style={{ fontSize: "11px", color: "var(--eh-text-muted)", fontWeight: "700", textTransform: "uppercase" }}>
                  Tổng lượt quét
                </small>
              </div>
            </div>
          </section>

          {/* Lịch sử quét vé trong ca */}
          <section
            style={{
              background: "var(--eh-surface)",
              padding: "22px 24px",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--eh-border)",
              boxShadow: "var(--eh-shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text-primary)", letterSpacing: "-0.02em" }}>
              Lịch sử quét vừa qua
            </h3>

            {logs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      background: log.success ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                      border: `1px solid ${log.success ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                      borderRadius: "var(--radius-lg)",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <strong style={{ fontFamily: "monospace", display: "block", fontSize: "13px", color: "var(--eh-text-primary)" }}>
                        {log.code}
                      </strong>
                      <small style={{ color: log.success ? "#059669" : "#dc2626", fontWeight: "600" }}>
                        {log.message}
                      </small>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--eh-text-muted)", fontWeight: "600" }}>
                      {log.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--eh-text-muted)", margin: 0 }}>
                Chưa có lượt quét vé nào trong phiên này.
              </p>
            )}
          </section>

          <div style={{ textAlign: "center" }}>
            <Link
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "var(--eh-brand)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
              to="/organizer/dashboard"
            >
              Quay lại Bảng điều khiển sự kiện <LineIcon name="arrow-right" />
            </Link>
          </div>
        </aside>
      </div>
    </OrganizerLayout>
  );
}
