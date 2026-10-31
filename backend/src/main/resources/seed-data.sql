-- ==============================================================================
-- EventHub Realistic Comprehensive Seed Data for Testing & UI Demonstration
-- ==============================================================================

-- 1. TẠO TÀI KHOẢN NGƯỜI DÙNG CHUẨN (Mật khẩu mặc định: 123456)
-- Bcrypt hash cho '123456': $2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS

INSERT INTO users (id, email, password, full_name, phone, role, status, avatar_url, created_at, updated_at)
VALUES
  ('usr-organizer-01', 'organizer@eventhub.vn', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Ban Tổ Chức TechVN', '0901234567', 'ORGANIZER', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('usr-organizer-02', 'music.stage@eventhub.vn', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Saigon Music Stage', '0912345678', 'ORGANIZER', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('usr-customer-01', 'nguyenvana@gmail.com', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Nguyễn Văn An', '0987654321', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('usr-customer-02', 'tranthib@gmail.com', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Trần Thị Bích', '0978123456', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('usr-customer-03', 'lequangc@gmail.com', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Lê Quang Cường', '0965432198', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('usr-customer-04', 'phamthid@gmail.com', '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS', 'Phạm Thị Dung', '0945678901', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, full_name = EXCLUDED.full_name, role = EXCLUDED.role, status = EXCLUDED.status;

-- Cập nhật mật khẩu 123456 cho các tài khoản test chính: abc@eventhub.com (Admin) và ab@eventhub.com (Organizer)
UPDATE users SET password = '$2a$10$dE7TIveoChPytKEep9mxmeDAFb/dm046OfrY/t/GnjtNiOdnyqKGS' WHERE email IN ('abc@eventhub.com', 'ab@eventhub.com', 'test@eventhub.com');


-- 2. TẠO CÁC SỰ KIỆN ĐA DẠNG (Âm nhạc, Công nghệ, Workshop, Thiết kế, Thể thao, Kinh doanh)
INSERT INTO events (id, title, description, category, location, start_at, end_at, status, thumbnail_url, organizer_id, created_at, updated_at)
VALUES
  (
    'evt-ai-bootcamp-2026',
    'AI & Java Backend Bootcamp: Kiến Trúc Phân Tán',
    'Khóa workshop thực chiến chuyên sâu 2 ngày dành cho kỹ sư phần mềm: Tối ưu hiệu năng Spring Boot 3.5, tích hợp Redis Caching, bảo vệ giao dịch tài chính và tích hợp AI Agent vào hệ thống backend.',
    'Công nghệ',
    'Dreamplex Coworking Space, Quận 1, TP.HCM',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days 6 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'evt-indie-music-saigon',
    'Đêm Nhạc Indie Sài Gòn: Gió Mùa & Những Bản Tình Ca',
    'Không gian âm nhạc mộc mạc và sâu lắng với sự tham gia của các ban nhạc Indie hàng đầu Sài Gòn. Thưởng thức ly cocktail nồng nàn và hòa mình vào giai điệu acoustic ngọt ngào.',
    'Âm nhạc / Concert',
    'The Observatory Rooftop, Quận 4, TP.HCM',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days 4 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'evt-ux-design-hanoi',
    'Workshop Thiết Kế Sản Phẩm UX/UI Cho Người Mới Bắt Đầu',
    'Khám phá quy trình Design Thinking, phương pháp nghiên cứu người dùng (User Research), xây dựng Wireframe và thực hành thiết kế Component System trên Figma chuyên nghiệp.',
    'Workshop',
    'Toong Tràng Thi, Hoàn Kiếm, Hà Nội',
    NOW() + INTERVAL '6 days',
    NOW() + INTERVAL '6 days 4 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'evt-startup-networking-danang',
    'Danang Startup & Founder Networking Night 2026',
    'Đêm hội kết nối 150+ Nhà sáng lập, CTO, Builder và Quỹ đầu tư mạo hiểm công nghệ tại miền Trung. Cơ hội pitch dự án trực tiếp và mở rộng mạng lưới đối tác chiến lược.',
    'Kinh doanh',
    'Enouvo Space, Sơn Trà, Đà Nẵng',
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '8 days 3 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'evt-marathon-dalat-trail',
    'Dalat Highland Trail Marathon 2026',
    'Giải chạy địa hình xuyên qua những cánh rừng thông nguyên sinh hùng vĩ và đồi hoa dại Đà Lạt. Cung đường chạy thử thách nhưng mang lại trải nghiệm hòa mình vào thiên nhiên tuyệt diệu.',
    'Thể thao',
    'Thung Lũng Tình Yêu, TP. Đà Lạt',
    NOW() + INTERVAL '12 days',
    NOW() + INTERVAL '12 days 8 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'evt-modern-art-gallery-hcm',
    'Triển Lãm Nghệ Thuật Đương Đại: Những Chiều Ký Ức',
    'Không gian thị giác đa giác quan trưng bày hơn 60 tác phẩm hội họa, điêu khắc sắp đặt và nghệ thuật thị giác số của các nghệ sĩ trẻ đương đại Việt Nam.',
    'Thiết kế & Nghệ thuật',
    'Bảo tàng Mỹ thuật TP.HCM, Quận 1, TP.HCM',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days 8 hours',
    'PUBLISHED',
    'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1200&q=80',
    'ea2ef342-2e55-4c56-a222-46d2f692901d',
    NOW() - INTERVAL '1 days',
    NOW() - INTERVAL '1 days'
  )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category, location = EXCLUDED.location, status = EXCLUDED.status, thumbnail_url = EXCLUDED.thumbnail_url;


-- 3. TẠO CÁC LOẠI VÉ (TICKET TYPES) CHO TỪNG SỰ KIỆN
INSERT INTO ticket_types (id, event_id, name, description, price, quantity, sold_quantity, created_at, updated_at)
VALUES
  -- AI Bootcamp
  ('tt-ai-early', 'evt-ai-bootcamp-2026', 'Vé Early Bird (Giảm 30%)', 'Vé ưu đãi dành cho 50 người đăng ký đầu tiên', 199000.00, 50, 48, NOW(), NOW()),
  ('tt-ai-standard', 'evt-ai-bootcamp-2026', 'Vé Tiêu Chuẩn (Full Access)', 'Bao gồm tài liệu bài giảng, tea-break và chứng chỉ', 299000.00, 80, 25, NOW(), NOW()),
  ('tt-ai-vip', 'evt-ai-bootcamp-2026', 'Vé VIP 1-on-1 Mentoring', 'Ghế hàng đầu, ăn trưa kết nối cùng Speaker và 1 giờ review CV', 599000.00, 15, 8, NOW(), NOW()),

  -- Indie Music Saigon
  ('tt-indie-regular', 'evt-indie-music-saigon', 'Vé Đứng Thường (GA)', 'Bao gồm 01 phần đồ uống chào mừng', 250000.00, 150, 130, NOW(), NOW()),
  ('tt-indie-sofa', 'evt-indie-music-saigon', 'Vé Bàn Sofa VIP (Nhóm 4 người)', 'Bàn trung tâm view trực diện sân khấu, set rượu vang và đồ ăn nhẹ', 990000.00, 20, 18, NOW(), NOW()),

  -- UX Design Hanoi
  ('tt-ux-single', 'evt-ux-design-hanoi', 'Vé Tham Dự Cá Nhân', 'Bao gồm file tài liệu Figma mẫu và đồ ăn nhẹ', 280000.00, 40, 38, NOW(), NOW()),
  ('tt-ux-pair', 'evt-ux-design-hanoi', 'Vé Cặp Đôi (Combo 2 người)', 'Ưu đãi tiết kiệm khi đi học cùng bạn đồng hành', 480000.00, 20, 14, NOW(), NOW()),

  -- Startup Networking Danang
  ('tt-startup-entry', 'evt-startup-networking-danang', 'Vé Networking & Tiệc Teabreak', 'Giao lưu tự do, tiệc nhẹ cocktail và danh bạ kết nối', 180000.00, 100, 65, NOW(), NOW()),
  ('tt-startup-pitch', 'evt-startup-networking-danang', 'Vé Pitching Dự Án (Founder)', 'Bao gồm 3 phút pitch trực tiếp trên sân khấu trước hội đồng quỹ', 600000.00, 10, 6, NOW(), NOW()),

  -- Dalat Trail Marathon
  ('tt-run-10km', 'evt-marathon-dalat-trail', 'Cự Ly 10KM Discovery', 'Bộ Race Kit tiêu chuẩn: Áo bib, kỷ niệm chương và hỗ trợ y tế', 350000.00, 200, 120, NOW(), NOW()),
  ('tt-run-21km', 'evt-marathon-dalat-trail', 'Cự Ly 21KM Half Marathon', 'Bao gồm Race kit cao cấp, áo Finisher và tiệc gala bế mạc', 650000.00, 100, 85, NOW(), NOW()),

  -- Art Gallery
  ('tt-art-free', 'evt-modern-art-gallery-hcm', 'Vé Tham Quan Miễn Phí', 'Vé vào cổng khung giờ buổi sáng (Đăng ký trước)', 0.00, 200, 145, NOW(), NOW()),
  ('tt-art-guide', 'evt-modern-art-gallery-hcm', 'Vé Tour Có Hướng Dẫn Viên', 'Nghe thuyết minh chuyên sâu về từng tác phẩm và gặp gỡ họa sĩ', 120000.00, 50, 32, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity;


-- 4. TẠO CÁC ĐƠN HÀNG MẪU (BOOKINGS, ITEMS, PAYMENTS, ISSUED TICKETS)
-- Đơn hàng 1: Khách hàng Nguyễn Văn An mua 2 vé AI Bootcamp (CONFIRMED)
INSERT INTO bookings (id, customer_id, total_amount, status, created_at, updated_at)
VALUES ('bk-demo-001', 'usr-customer-01', 598000.00, 'CONFIRMED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_items (id, booking_id, ticket_type_id, quantity, unit_price, subtotal, created_at, updated_at)
VALUES ('bi-demo-001', 'bk-demo-001', 'tt-ai-standard', 2, 299000.00, 598000.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, booking_id, amount, provider, provider_transaction_id, status, paid_at, created_at, updated_at)
VALUES ('pm-demo-001', 'bk-demo-001', 598000.00, 'VNPAY', 'VNPAY14892019', 'SUCCESS', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO issued_tickets (id, booking_id, customer_id, ticket_type_id, ticket_code, qr_payload, status, created_at, updated_at)
VALUES 
  ('tkt-demo-001', 'bk-demo-001', 'usr-customer-01', 'tt-ai-standard', 'EH-AI-9021', 'EVENTHUB:TICKET:EH-AI-9021', 'VALID', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('tkt-demo-002', 'bk-demo-001', 'usr-customer-01', 'tt-ai-standard', 'EH-AI-9022', 'EVENTHUB:TICKET:EH-AI-9022', 'VALID', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;


-- Đơn hàng 2: Trần Thị Bích mua vé Đêm nhạc Indie (CONFIRMED & ĐÃ CHECK-IN TẠI QUẦY)
INSERT INTO bookings (id, customer_id, total_amount, status, created_at, updated_at)
VALUES ('bk-demo-002', 'usr-customer-02', 250000.00, 'CONFIRMED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_items (id, booking_id, ticket_type_id, quantity, unit_price, subtotal, created_at, updated_at)
VALUES ('bi-demo-002', 'bk-demo-002', 'tt-indie-regular', 1, 250000.00, 250000.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, booking_id, amount, provider, provider_transaction_id, status, paid_at, created_at, updated_at)
VALUES ('pm-demo-002', 'bk-demo-002', 250000.00, 'VNPAY', 'VNPAY14892020', 'SUCCESS', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO issued_tickets (id, booking_id, customer_id, ticket_type_id, ticket_code, qr_payload, status, checked_in_at, created_at, updated_at)
VALUES ('tkt-demo-003', 'bk-demo-002', 'usr-customer-02', 'tt-indie-regular', 'EH-MUSIC-8831', 'EVENTHUB:TICKET:EH-MUSIC-8831', 'USED', NOW() - INTERVAL '1 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days')
ON CONFLICT (id) DO NOTHING;


-- Đơn hàng 3: Lê Quang Cường đặt vé chạy Trail Đà Lạt đang chờ chuyển khoản (PENDING_PAYMENT cho Admin đối soát)
INSERT INTO bookings (id, customer_id, total_amount, status, created_at, updated_at)
VALUES ('bk-demo-003', 'usr-customer-03', 650000.00, 'PENDING_PAYMENT', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_items (id, booking_id, ticket_type_id, quantity, unit_price, subtotal, created_at, updated_at)
VALUES ('bi-demo-003', 'bk-demo-003', 'tt-run-21km', 1, 650000.00, 650000.00, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, booking_id, amount, provider, provider_transaction_id, status, created_at, updated_at)
VALUES ('pm-demo-003', 'bk-demo-003', 650000.00, 'MANUAL_BANK_TRANSFER', 'BANK_TX_987654', 'PENDING', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
