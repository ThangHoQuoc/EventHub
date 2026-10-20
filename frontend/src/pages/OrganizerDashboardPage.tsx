import { useState } from "react";
import { Link } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { LineIcon } from "../components/ui/LineIcon";
import { mockOrganizerEvents, mockOrganizerStats } from "../data/mockOrganizer";
import { formatCurrency, formatDate } from "../utils/format";
import type { OrganizerEvent } from "../types/organizer";

export function OrganizerDashboardPage() {
  const [events, setEvents] = useState<OrganizerEvent[]>(mockOrganizerEvents);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    return e.status === filter;
  });

  return (
    <OrganizerLayout
      activeNav="dashboard"
      description="Quản lý vòng đời sự kiện, theo dõi doanh thu và tình trạng bán vé thời gian thực."
      title="Bảng điều khiển & Sự kiện"
    >
      {/* 4 KPI Metric Cards */}
      <div className="ev-org-metrics-grid">
        <div className="ev-org-metric-card">
          <div className="ev-org-metric-icon">
            <LineIcon name="calendar" />
          </div>
          <div>
            <small>Tổng số sự kiện</small>
            <strong>{mockOrganizerStats.totalEvents}</strong>
            <span>{mockOrganizerStats.publishedEvents} đang mở bán</span>
          </div>
        </div>

        <div className="ev-org-metric-card">
          <div className="ev-org-metric-icon" style={{ background: "var(--eh-green-50)", color: "var(--eh-green)" }}>
            <LineIcon name="ticket" />
          </div>
          <div>
            <small>Vé đã bán / Sức chứa</small>
            <strong>{mockOrganizerStats.totalTicketsSold} / {mockOrganizerStats.totalCapacity}</strong>
            <span>Tỷ lệ lấp đầy: {Math.round((mockOrganizerStats.totalTicketsSold / mockOrganizerStats.totalCapacity) * 100)}%</span>
          </div>
        </div>

        <div className="ev-org-metric-card">
          <div className="ev-org-metric-icon" style={{ background: "var(--eh-amber-light)", color: "var(--eh-warning)" }}>
            <LineIcon name="card" />
          </div>
          <div>
            <small>Doanh thu tạm tính</small>
            <strong>{formatCurrency(mockOrganizerStats.estimatedRevenue)}</strong>
            <span>Chưa trừ phí dịch vụ</span>
          </div>
        </div>

        <div className="ev-org-metric-card">
          <div className="ev-org-metric-icon" style={{ background: "#eef2f6", color: "#3056d3" }}>
            <LineIcon name="shield" />
          </div>
          <div>
            <small>Trạng thái trạm soát vé</small>
            <strong style={{ fontSize: "16px", color: "var(--eh-green)" }}>Sẵn sàng check-in</strong>
            <span>Đã kết nối máy quét QR</span>
          </div>
        </div>
      </div>

      {/* Events List Controls */}
      <div className="ev-customer-filter-bar" style={{ marginTop: "32px" }}>
        <div className="ev-customer-filter-tabs">
          <button
            className={filter === "ALL" ? "is-active" : ""}
            onClick={() => setFilter("ALL")}
            type="button"
          >
            Tất cả sự kiện ({events.length})
          </button>
          <button
            className={filter === "PUBLISHED" ? "is-active" : ""}
            onClick={() => setFilter("PUBLISHED")}
            type="button"
          >
            Đang mở bán ({events.filter((e) => e.status === "PUBLISHED").length})
          </button>
          <button
            className={filter === "DRAFT" ? "is-active" : ""}
            onClick={() => setFilter("DRAFT")}
            type="button"
          >
            Bản nháp ({events.filter((e) => e.status === "DRAFT").length})
          </button>
        </div>

        <Link className="ev-btn-primary" to="/organizer/events/new">
          <LineIcon name="plus" />
          Tạo sự kiện mới
        </Link>
      </div>

      {/* Events Table */}
      <div className="ev-bookings-table-wrap">
        <table className="ev-bookings-table">
          <thead>
            <tr>
              <th>Sự kiện</th>
              <th>Thời gian</th>
              <th>Địa điểm</th>
              <th>Vé đã bán</th>
              <th>Doanh thu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => {
              const isPublished = event.status === "PUBLISHED";
              const isDraft = event.status === "DRAFT";

              return (
                <tr key={event.id}>
                  <td>
                    <div className="ev-org-event-title-cell">
                      <strong>{event.title}</strong>
                      <small>{event.category} · {event.ticketTypes.length} hạng vé</small>
                    </div>
                  </td>
                  <td>
                    <span>{formatDate(event.startAt)}</span>
                  </td>
                  <td>
                    <span>{event.city}</span>
                  </td>
                  <td>
                    <div className="ev-org-progress-cell">
                      <span>{event.soldTicketsCount} / {event.totalTicketsCount}</span>
                      <div className="ev-org-mini-progress">
                        <div
                          style={{
                            width: `${event.totalTicketsCount ? (event.soldTicketsCount / event.totalTicketsCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{formatCurrency(event.revenue)}</strong>
                  </td>
                  <td>
                    <span className={`ev-booking-status-badge ${isPublished ? "status-confirmed" : "status-cancelled"}`}>
                      <i />
                      {isPublished ? "Đang mở bán" : isDraft ? "Bản nháp" : "Đã hủy"}
                    </span>
                  </td>
                  <td>
                    <div className="ev-org-action-buttons">
                      <Link
                        className="ev-org-btn-sm"
                        title="Cấu hình hạng vé"
                        to={`/organizer/events/${event.id}/tickets`}
                      >
                        <LineIcon name="ticket" />
                        Vé
                      </Link>
                      <Link
                        className="ev-org-btn-sm"
                        title="Chỉnh sửa hoặc xuất bản sự kiện"
                        to={`/organizer/events/${event.id}/edit`}
                      >
                        <LineIcon name="trending" />
                        Quản lý
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </OrganizerLayout>
  );
}
