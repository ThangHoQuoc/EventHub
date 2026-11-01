import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
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

interface CameraDevice {
  id: string;
  label: string;
}

// Phát âm thanh phản hồi bằng Web Audio API không phụ thuộc file ngoài
function triggerFeedback(success: boolean) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    }
  } catch {
    // Audio context may be restricted by autoplay policy
  }

  if (navigator.vibrate) {
    try {
      navigator.vibrate(success ? [100] : [200, 100, 200]);
    } catch {
      // Ignore vibration error
    }
  }
}

export function CheckInStationPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState<TicketDto>();
  const [logs, setLogs] = useState<ScanLog[]>([]);

  // Camera states
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "ready" | "error" | "paused">("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lock = useRef(false);
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: "", time: 0 });

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
      triggerFeedback(true);
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
      triggerFeedback(false);
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

  // Khởi động Camera Scanner
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!cameraActive) {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch {
            // Ignore stop errors
          }
        }
        setCameraStatus("paused");
        return;
      }

      setCameraStatus("requesting");
      setCameraErrorMessage("");

      try {
        // Lấy danh sách camera nếu có
        try {
          const devices = await Html5Qrcode.getCameras();
          if (isMounted && devices && devices.length > 0) {
            setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
          }
        } catch {
          // Trình duyệt có thể chưa cấp quyền enumerateDevices
        }

        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("eh-qr-reader");
        }

        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          try {
            await scanner.stop();
          } catch {
            // Ignore
          }
        }

        const cameraConfig = selectedCameraId
          ? selectedCameraId
          : { facingMode: facingMode };

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;
            const now = Date.now();
            // Debounce 2.5s đối với cùng 1 mã
            if (
              lastScannedRef.current.code === decodedText &&
              now - lastScannedRef.current.time < 2500
            ) {
              return;
            }
            lastScannedRef.current = { code: decodedText, time: now };
            performCheckIn(decodedText);
          },
          () => {
            // Frame parse error - ignore
          }
        );

        if (isMounted) {
          setCameraStatus("ready");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setCameraStatus("error");
        const msg =
          err instanceof Error
            ? err.message
            : "Không thể truy cập camera. Vui lòng cấp quyền trên trình duyệt.";
        if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
          setCameraErrorMessage("Quyền truy cập Camera bị từ chối. Vui lòng cấp quyền trên thanh địa chỉ.");
        } else if (msg.includes("NotFoundError") || msg.includes("Requested device not found")) {
          setCameraErrorMessage("Không tìm thấy Camera trên thiết bị của bạn.");
        } else {
          setCameraErrorMessage("Lỗi camera: " + msg);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive, selectedCameraId, facingMode]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    performCheckIn(ticketCode);
  }

  function handleDemoScan() {
    performCheckIn("EH-DEMO-98214");
  }

  function toggleFacingMode() {
    setSelectedCameraId("");
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  const successCount = logs.filter((l) => l.success).length;

  return (
    <OrganizerLayout
      activeNav="checkin"
      description="Trạm soát vé trực tiếp tại cửa sự kiện: Quét camera mã QR Code hoặc nhập mã vé để xác thực khách vào cửa thời gian thực."
      title="Trạm soát vé Check-in trực tiếp"
    >
      <div className="eh-checkin-layout">
        {/* Cột trái: Máy quét Camera & Kết quả */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Khung máy quét Laser Scanner tích hợp Camera thật */}
          <section aria-label="Kính ngắm quét mã vé" className="eh-checkin-scanner-box">
            {/* Viewfinder kính quét camera */}
            <div className="eh-scanner-viewfinder">
              {/* Thẻ chứa Video Camera từ html5-qrcode */}
              <div id="eh-qr-reader" className="eh-qr-reader-container" />

              {/* 4 góc viền laser neon */}
              <div className="eh-viewfinder-corner eh-corner-tl" />
              <div className="eh-viewfinder-corner eh-corner-tr" />
              <div className="eh-viewfinder-corner eh-corner-bl" />
              <div className="eh-viewfinder-corner eh-corner-br" />

              {/* Tia laser quét chuyển động neon */}
              {cameraActive && cameraStatus === "ready" && <div className="eh-scanner-laser" />}

              {/* Trạng thái quét & Hướng dẫn */}
              <div className="eh-scanner-status-text">
                <LineIcon name="search" />
                <p style={{ margin: 0, fontWeight: "700" }}>
                  {cameraStatus === "ready" && "Camera sẵn sàng · Đưa mã QR vào khung"}
                  {cameraStatus === "requesting" && "Đang kích hoạt Camera..."}
                  {cameraStatus === "paused" && "Camera đang tạm dừng"}
                  {cameraStatus === "error" && "Không thể mở Camera"}
                  {cameraStatus === "idle" && "Đang chuẩn bị máy quét"}
                </p>
                {cameraStatus === "error" ? (
                  <small style={{ color: "#fca5a5", display: "block", marginTop: "4px" }}>
                    {cameraErrorMessage}
                  </small>
                ) : (
                  <small style={{ color: "rgba(255,255,255,0.7)", display: "block", marginTop: "4px" }}>
                    {cameraStatus === "ready"
                      ? "Tự động nhận diện & phát âm thanh check-in"
                      : "Sử dụng camera webcam máy tính hoặc camera sau điện thoại"}
                  </small>
                )}
              </div>
            </div>

            {/* Các phím điều khiển Camera */}
            <div
              style={{
                marginTop: "22px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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

              {cameras.length > 1 ? (
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  style={{
                    fontSize: "12px",
                    height: "36px",
                    background: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "#ffffff",
                    borderRadius: "var(--radius-lg)",
                    padding: "0 10px",
                    fontWeight: "600",
                  }}
                >
                  <option value="" style={{ color: "#000" }}>
                    Mặc định ({facingMode === "environment" ? "Sau" : "Trước"})
                  </option>
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id} style={{ color: "#000" }}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={toggleFacingMode}
                  style={{
                    fontSize: "12px",
                    minHeight: "36px",
                    background: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    fontWeight: "700",
                  }}
                  type="button"
                  title="Chuyển đổi giữa Camera trước và Camera sau"
                >
                  {facingMode === "environment" ? "Dùng Camera trước" : "Dùng Camera sau"}
                </button>
              )}

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

          {/* Form nhập mã vé thủ công (dự phòng trường hợp không có camera) */}
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
