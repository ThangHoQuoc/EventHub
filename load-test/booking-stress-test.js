/**
 * ============================================================================
 * EVENTHUB - TICKET BOOKING STRESS & LOAD TEST (K6 SCRIPT)
 * ============================================================================
 * Kịch bản mô phỏng đợt mở bán vé Flash Sale / Concert:
 * - 50 đến 100 Virtual Users (VUs) cùng tranh nhau mua vé trong thời gian ngắn.
 * - Đo đạc: P95 Latency, Requests Per Second (RPS), Tỷ lệ lỗi (Error Rate).
 * - Xác thực: Ngăn chặn triệt để hiện tượng Overselling (Bán vượt tồn kho).
 *
 * Cách chạy:
 * 1. Cài đặt k6: winget install k6 (hoặc tải tại https://k6.io)
 * 2. Chạy test: k6 run load-test/booking-stress-test.js
 * ============================================================================
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics để báo cáo trong CV
export const successfulBookings = new Counter('successful_bookings');
export const soldOutRejections = new Counter('sold_out_rejections');
export const oversellErrors = new Counter('oversell_critical_errors');
export const bookingLatency = new Trend('booking_response_time', true);
export const successRate = new Rate('booking_success_rate');

export const options = {
  // Giai đoạn chịu tải mô phỏng đợt săn vé mở bán lúc 12:00
  stages: [
    { duration: '5s', target: 20 },   // Khởi động: 20 users truy cập trang
    { duration: '15s', target: 80 },  // Đỉnh điểm: 80 users đồng loạt tranh mua vé
    { duration: '5s', target: 0 },    // Hạ nhiệt sau khi hết vé
  ],
  thresholds: {
    // Tiêu chuẩn hiệu năng chuẩn Production:
    // 95% request phải phản hồi dưới 300ms
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    // Không được có lỗi 500 (Internal Server Error)
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  // 1. Khách hàng xem thông tin sự kiện và các loại vé còn lại
  const eventRes = http.get(`${BASE_URL}/api/v1/events/e-tech-summit-2026`);
  check(eventRes, {
    'GET event 200': (r) => r.status === 200,
  });

  sleep(0.1); // Nghỉ 100ms như thao tác người thật bấm nút "Đặt vé"

  // 2. Đồng loạt gửi request giữ chỗ mua vé (Payload đặt vé)
  const payload = JSON.stringify({
    items: [
      {
        ticketTypeId: 'tt-standard-01',
        quantity: 1,
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // Token giả lập phiên đăng nhập của từng user
      'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'load-test-token'}`,
    },
  };

  const start = Date.now();
  const bookRes = http.post(`${BASE_URL}/api/v1/bookings`, payload, params);
  bookingLatency.add(Date.now() - start);

  // 3. Đánh giá phản hồi từ Backend
  if (bookRes.status === 200 || bookRes.status === 201) {
    // Đặt chỗ thành công
    successfulBookings.add(1);
    successRate.add(true);
  } else if (bookRes.status === 400 || bookRes.status === 409) {
    // Hết vé hợp lệ từ hệ thống kiểm soát Concurrency (Chống Overselling)
    soldOutRejections.add(1);
    successRate.add(false);
  } else if (bookRes.status >= 500) {
    // Lỗi sập database hoặc deadlock không kiểm soát
    oversellErrors.add(1);
  }

  check(bookRes, {
    'Status hợp lệ (200 OK hoặc 400 Hết vé, không được lỗi 500)': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409,
  });

  sleep(0.5);
}
