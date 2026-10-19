import { useState } from "react";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockRecentCheckIns } from "../data/mockOrganizer";
import { checkInTicketApi } from "../api/organizer";
import { useAuth } from "../context/AuthContext";
import type { CheckInRecord } from "../types/organizer";

export function CheckInStationPage() {
  const { user } = useAuth();
  const [ticketInput, setTicketInput] = useState("");
  const [records, setRecords] = useState<CheckInRecord[]>(mockRecentCheckIns);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    status: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID";
    message: string;
    holderName?: string;
    ticketType?: string;
  } | null>(null);

  async function processCode(code: string) {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    setIsProcessing(true);

    try {
      const ticket = await checkInTicketApi({ ticketCode: cleanCode });
      setCurrentResult({
        status: "SUCCESS",
        message: "CHECK-IN HỢP LỆ! Chào mừng quý khách tham dự sự kiện.",
        holderName: "Khách tham dự",
        ticketType: ticket.ticketTypeName || "Vé sự kiện",
      });
      setRecords((prev) => [
        {
          id: `ck-${Date.now()}`,
          ticketCode: ticket.ticketCode,
          eventTitle: ticket.eventTitle || "Sự kiện EventHub",
          holderName: "Khách tham dự",
          ticketTypeName: ticket.ticketTypeName || "Vé sự kiện",
          checkedInAt: new Date().toLocaleTimeString("vi-VN"),
          status: "SUCCESS",
          staffName: user?.fullName || "Nhân viên soát vé",
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "";
      const isAlreadyUsed = errMsg.toLowerCase().includes("used") || errMsg.toLowerCase().includes("đã");

      if (isAlreadyUsed || cleanCode.includes("USED")) {
        setCurrentResult({
          status: "ALREADY_CHECKED_IN",
          message: "CẢNH BÁO: Vé này đã được check-in trước đó!",
          holderName: "Khách tham dự",
          ticketType: "Vé Tiêu Chuẩn",
        });
        setRecords((prev) => [
          {
            id: `ck-${Date.now()}`,
            ticketCode: cleanCode,
            eventTitle: "Sự kiện EventHub",
            holderName: "Khách tham dự",
            ticketTypeName: "Vé Tiêu Chuẩn",
            checkedInAt: new Date().toLocaleTimeString("vi-VN"),
            status: "ALREADY_CHECKED_IN",
            staffName: user?.fullName || "Nhân viên soát vé",
          },
          ...prev,
        ]);
      } else {
        setCurrentResult({
          status: "INVALID",
          message: errMsg || "MÃ VÉ KHÔNG HỢP LỆ HOẶC KHÔNG TỒN TẠI TRÊN HỆ THỐNG!",
        });
        setRecords((prev) => [
          {
            id: `ck-${Date.now()}`,
            ticketCode: cleanCode,
            eventTitle: "Không xác định",
            holderName: "Không xác định",
            ticketTypeName: "N/A",
            checkedInAt: new Date().toLocaleTimeString("vi-VN"),
            status: "INVALID",
            staffName: user?.fullName || "Nhân viên soát vé",
          },
          ...prev,
        ]);
      }
    } finally {
      setIsProcessing(false);
      setTicketInput("");
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    processCode(ticketInput);
  }

  return (
    <OrganizerLayout
      activeNav="checkin"
      description="Giao diện kiểm soát vào cổng: Quét camera mã QR hoặc gõ mã vé trực tiếp để xác thực người tham dự."
      title="Trạm soát vé Check-in trực tiếp"
    >
      <div className="ev-checkin-station-grid">
        {/* Scanner Panel */}
        <div className="ev-checkin-scanner-card">
          <div className="ev-scanner-camera-box">
            <div className="ev-scanner-target">
              <span className="corner top-left" />
              <span className="corner top-right" />
              <span className="corner bottom-left" />
              <span className="corner bottom-right" />
              <div className="ev-scanner-beam" />
            </div>
            <p>
              <LineIcon name="search" />
              Đưa mã QR trên vé của khách vào khung quét camera
            </p>
          </div>

          <form className="ev-manual-checkin-form" onSubmit={handleManualSubmit}>
            <label htmlFor="ticketCodeInput">Hoặc nhập mã vé bằng tay</label>
            <div className="ev-manual-input-row">
              <input
                id="ticketCodeInput"
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="VD: EH-TECH-98214"
                type="text"
                value={ticketInput}
              />
              <button className="ev-btn-primary" type="submit">
                Kiểm tra vé
              </button>
            </div>
            <small>Có thể thử nhập: <code>EH-TECH-98214</code> để xem phản hồi</small>
          </form>

          {/* Verification Result Alert Box */}
          {currentResult && (
            <div className={`ev-checkin-result-box is-${currentResult.status.toLowerCase()}`}>
              <div className="ev-result-icon">
                <LineIcon name={currentResult.status === "SUCCESS" ? "check" : "alert"} />
              </div>
              <div className="ev-result-text">
                <h3>{currentResult.message}</h3>
                {currentResult.holderName && (
                  <p>
                    Người sở hữu: <strong>{currentResult.holderName}</strong> · Hạng vé: <strong>{currentResult.ticketType}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Realtime Check-in Log */}
        <div className="ev-checkin-log-card">
          <div className="ev-checkin-log-head">
            <h3>Lịch sử quét vé thời gian thực</h3>
            <span className="ev-log-counter">{records.filter((r) => r.status === "SUCCESS").length} đã vào cổng</span>
          </div>

          <div className="ev-checkin-log-list">
            {records.map((rec) => (
              <div className={`ev-checkin-log-item is-${rec.status.toLowerCase()}`} key={rec.id}>
                <div className="ev-log-status-icon">
                  <LineIcon name={rec.status === "SUCCESS" ? "check" : "alert"} />
                </div>
                <div className="ev-log-item-body">
                  <div className="ev-log-topline">
                    <strong>{rec.holderName}</strong>
                    <time>{rec.checkedInAt}</time>
                  </div>
                  <p>{rec.ticketTypeName} · <code>{rec.ticketCode}</code></p>
                  <small>
                    {rec.status === "SUCCESS"
                      ? "Check-in thành công"
                      : rec.status === "ALREADY_CHECKED_IN"
                      ? "Trùng lặp: Vé đã sử dụng trước đó"
                      : "Vé không hợp lệ"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
