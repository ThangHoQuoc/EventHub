import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { RequestState } from "../components/ui/RequestState";
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
      description="Trạm kiểm soát vé tại cổng: Nhập mã soát vé hoặc payload từ thiết bị đọc QR để xác thực khách vào cửa."
      title="Trạm soát vé Check-in trực tiếp"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" }}>
        {/* Cột trái: Máy quét & Kết quả */}
        <div style={{ display: "grid", gap: "24px" }}>
          {/* Khung máy quét Laser Scanner Mockup */}
          <section
            style={{
              background: "#0d1612",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid rgba(31, 138, 91, 0.4)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              position: "relative",
              padding: "36px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              color: "#ffffff",
            }}
          >
            {/* Viewfinder kính quét */}
            <div
              style={{
                width: "220px",
                height: "220px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.03)",
              }}
            >
              {/* 4 góc viền laser */}
              <div style={{ position: "absolute", top: 0, left: 0, width: "24px", height: "24px", borderTop: "3px solid var(--eh-green)", borderLeft: "3px solid var(--eh-green)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "3px solid var(--eh-green)", borderRight: "3px solid var(--eh-green)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "24px", height: "24px", borderBottom: "3px solid var(--eh-green)", borderLeft: "3px solid var(--eh-green)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderBottom: "3px solid var(--eh-green)", borderRight: "3px solid var(--eh-green)" }} />

              {/* Tia laser quét */}
              {cameraActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, #22c55e, #86efac, #22c55e, transparent)",
                    boxShadow: "0 0 12px #22c55e, 0 0 24px #22c55e",
                  }}
                />
              )}

              <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
                <LineIcon name="search" />
                <p style={{ fontSize: "11px", margin: "6px 0 0" }}>
                  {cameraActive ? "Minh họa camera · chưa hỗ trợ quét trực tiếp" : "Camera đang tạm dừng"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCameraActive(!cameraActive)}
                style={{ fontSize: "11px", minHeight: "32px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
                type="button"
              >
                {cameraActive ? "Tạm dừng camera" : "Bật camera quét"}
              </button>
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={handleDemoScan}
                style={{ fontSize: "11px", minHeight: "32px" }}
                type="button"
              >
                <LineIcon name="sparkles" /> Thử quét mã mẫu
              </button>
            </div>
          </section>

          {/* Form nhập mã vé thủ công */}
          <section style={{ background: "var(--eh-surface)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 12px", color: "var(--eh-text)" }}>
              Hoặc nhập mã vé / chuỗi QR thủ công
            </h3>

            <form onSubmit={submit} style={{ display: "flex", gap: "10px" }}>
              <input
                disabled={busy}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Nhập mã vé (ví dụ: EH-INDIE-47120) hoặc dán toàn bộ chuỗi QR..."
                required
                style={{ flex: 1, height: "46px", borderRadius: "var(--radius-md)", border: "1px solid var(--eh-border)", padding: "0 14px", fontSize: "13px" }}
                value={ticketCode}
              />
              <button
                className="ev-btn-primary"
                disabled={busy || !ticketCode.trim()}
                style={{ height: "46px", padding: "0 22px", flexShrink: 0 }}
                type="submit"
              >
                {busy ? "Đang xác thực..." : "Check-in ngay"}
              </button>
            </form>
          </section>

          {/* Màn hình kết quả Check-in lớn */}
          {result && (
            <section
              style={{
                background: "var(--eh-green-50)",
                border: "2px solid var(--eh-green-100)",
                borderRadius: "var(--radius-xl)",
                padding: "28px",
                display: "grid",
                gap: "12px",
                boxShadow: "0 4px 20px rgba(31, 138, 91, 0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--eh-green)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--eh-green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LineIcon name="check" />
                </div>
                <div>
                  <strong style={{ fontSize: "18px", display: "block" }}>CHECK-IN THÀNH CÔNG!</strong>
                  <span style={{ fontSize: "12px", color: "var(--eh-green-hover)" }}>Khách đã được xác thực vào cửa</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--eh-green-100)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Mã vé</span>
                  <strong style={{ fontFamily: "monospace", fontSize: "14px" }}>{result.ticketCode}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Trạng thái</span>
                  <strong style={{ color: "var(--eh-green)" }}>{result.status}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Thời gian quét</span>
                  <strong>{result.checkedInAt ? formatDateTime(result.checkedInAt) : "Vừa xác thực"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--eh-placeholder)", fontSize: "11px", display: "block" }}>Loại vé</span>
                  <strong>{result.ticketTypeName || "Vé chuẩn"}</strong>
                </div>
              </div>
            </section>
          )}

          {error && (
            <section
              style={{
                background: "#fce8e6",
                border: "2px solid #fad2cf",
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                color: "var(--eh-error)",
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--eh-error)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LineIcon name="alert" />
              </div>
              <div>
                <strong style={{ fontSize: "16px", display: "block" }}>CHECK-IN KHÔNG HỢP LỆ!</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{error}</p>
              </div>
            </section>
          )}
        </div>

        {/* Cột phải: Thống kê & Bảng Log */}
        <aside style={{ display: "grid", gap: "20px" }}>
          {/* Thống kê ca trực */}
          <section style={{ background: "var(--eh-surface)", padding: "20px 24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
              Thống kê ca trực soát vé
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
              <div style={{ background: "var(--eh-green-50)", padding: "14px", borderRadius: "var(--radius-md)" }}>
                <strong style={{ fontSize: "24px", color: "var(--eh-green)", display: "block" }}>{successCount}</strong>
                <small style={{ fontSize: "11px", color: "var(--eh-green)" }}>Hợp lệ vào cửa</small>
              </div>
              <div style={{ background: "var(--eh-bg)", padding: "14px", borderRadius: "var(--radius-md)" }}>
                <strong style={{ fontSize: "24px", color: "var(--eh-text)", display: "block" }}>{logs.length}</strong>
                <small style={{ fontSize: "11px", color: "var(--eh-muted)" }}>Tổng lượt quét</small>
              </div>
            </div>
          </section>

          {/* Lịch sử quét vé trong ca */}
          <section style={{ background: "var(--eh-surface)", padding: "20px 24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--eh-border)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", margin: "0 0 14px", color: "var(--eh-text)" }}>
              Lịch sử quét vừa qua
            </h3>

            {logs.length > 0 ? (
              <div style={{ display: "grid", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: log.success ? "var(--eh-green-50)" : "#fce8e6",
                      borderRadius: "var(--radius-md)",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <strong style={{ fontFamily: "monospace", display: "block" }}>{log.code}</strong>
                      <small style={{ color: log.success ? "var(--eh-green)" : "var(--eh-error)" }}>{log.message}</small>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--eh-muted)" }}>{log.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--eh-placeholder)", margin: 0 }}>
                Chưa có lượt quét vé nào trong phiên này.
              </p>
            )}
          </section>

          <div style={{ textAlign: "center" }}>
            <Link className="ev-text-link" style={{ fontSize: "12px" }} to="/organizer/dashboard">
              Quay lại Bảng điều khiển sự kiện <LineIcon name="arrow-right" />
            </Link>
          </div>
        </aside>
      </div>
    </OrganizerLayout>
  );
}
