package com.eventhub.eventhub_backend.notification.service.Impl;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.notification.service.EmailService;
import com.eventhub.eventhub_backend.notification.service.QRCodeService;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;
    private final QRCodeService qrCodeService;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from-address:no-reply@eventhub.vn}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(Locale.of("vi", "VN"));

    @Async("mailTaskExecutor")
    @Override
    public void sendTicketConfirmationEmail(Booking booking, List<TicketResponse> tickets) {
        if (booking == null || booking.getCustomer() == null) {
            log.warn("Cannot send ticket confirmation email: booking or customer is null");
            return;
        }

        String recipientEmail = booking.getCustomer().getEmail();
        String customerName = booking.getCustomer().getFullName() != null ? booking.getCustomer().getFullName() : "Quý khách";
        String eventTitle = tickets != null && !tickets.isEmpty() && tickets.getFirst().getEventTitle() != null
                ? tickets.getFirst().getEventTitle()
                : "Sự kiện EventHub";

        String subject = "[EventHub] Xác nhận đặt vé thành công & Vé điện tử - " + eventTitle;

        try {
            String htmlContent = buildTicketConfirmationHtml(booking, customerName, eventTitle, tickets);

            if (mailEnabled) {
                sendHtmlEmail(recipientEmail, subject, htmlContent);
                log.info("Ticket confirmation email sent successfully to {}", recipientEmail);
            } else {
                log.info("[MOCK EMAIL] Mail sending is disabled or in sandbox mode.");
                log.info("[MOCK EMAIL] To: {} | Subject: {}", recipientEmail, subject);
                log.info("[MOCK EMAIL] Generated {} e-tickets with QR codes for booking ID: {}",
                        tickets != null ? tickets.size() : 0, booking.getId());
            }
        } catch (Exception e) {
            log.error("Failed to send ticket confirmation email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }

    @Async("mailTaskExecutor")
    @Override
    public void sendWaitlistOfferEmail(WaitlistOffer offer) {
        if (offer == null || offer.getWaitlistEntry() == null || offer.getWaitlistEntry().getCustomer() == null) {
            log.warn("Cannot send waitlist offer email: offer, entry or customer is null");
            return;
        }

        String recipientEmail = offer.getWaitlistEntry().getCustomer().getEmail();
        String customerName = offer.getWaitlistEntry().getCustomer().getFullName() != null
                ? offer.getWaitlistEntry().getCustomer().getFullName() : "Quý khách";
        String ticketTypeName = offer.getTicketType() != null ? offer.getTicketType().getName() : "Vé sự kiện";
        String eventTitle = offer.getTicketType() != null && offer.getTicketType().getEvent() != null
                ? offer.getTicketType().getEvent().getTitle()
                : "Sự kiện EventHub";

        String subject = "[EventHub] Bạn nhận được suất mua vé từ Danh sách chờ - " + eventTitle;

        try {
            String htmlContent = buildWaitlistOfferHtml(offer, customerName, eventTitle, ticketTypeName);

            if (mailEnabled) {
                sendHtmlEmail(recipientEmail, subject, htmlContent);
                log.info("Waitlist offer email sent successfully to {}", recipientEmail);
            } else {
                log.info("[MOCK EMAIL] Mail sending is disabled or in sandbox mode.");
                log.info("[MOCK EMAIL] To: {} | Subject: {}", recipientEmail, subject);
                log.info("[MOCK EMAIL] Waitlist offer for ticket type: {} expires at: {}", ticketTypeName, offer.getExpiresAt());
            }
        } catch (Exception e) {
            log.error("Failed to send waitlist offer email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }

    @Async("mailTaskExecutor")
    @Override
    public void sendSingleTicketEmail(Ticket ticket) {
        if (ticket == null || ticket.getCustomer() == null) {
            log.warn("Cannot resend ticket email: ticket or customer is null");
            return;
        }

        String recipientEmail = ticket.getCustomer().getEmail();
        String customerName = ticket.getCustomer().getFullName() != null ? ticket.getCustomer().getFullName() : "Quý khách";
        String eventTitle = ticket.getTicketType() != null && ticket.getTicketType().getEvent() != null
                ? ticket.getTicketType().getEvent().getTitle()
                : "Sự kiện EventHub";

        String subject = "[EventHub] Gửi lại vé điện tử - " + eventTitle;

        try {
            String qrBase64 = qrCodeService.generateQRCodeBase64(ticket.getQrPayload(), 240, 240);
            String ticketTypeName = ticket.getTicketType() != null ? ticket.getTicketType().getName() : "Vé tiêu chuẩn";

            String htmlContent = buildSingleTicketHtml(ticket, customerName, eventTitle, ticketTypeName, qrBase64);

            if (mailEnabled) {
                sendHtmlEmail(recipientEmail, subject, htmlContent);
                log.info("Single ticket email resent successfully to {}", recipientEmail);
            } else {
                log.info("[MOCK EMAIL] Resent ticket email to: {} for ticketCode: {}", recipientEmail, ticket.getTicketCode());
            }
        } catch (Exception e) {
            log.error("Failed to resend ticket email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress, "EventHub Ticketing");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        javaMailSender.send(message);
    }

    private String buildTicketConfirmationHtml(Booking booking, String customerName, String eventTitle, List<TicketResponse> tickets) {
        StringBuilder ticketsHtml = new StringBuilder();

        if (tickets != null && !tickets.isEmpty()) {
            for (TicketResponse t : tickets) {
                String qrBase64 = qrCodeService.generateQRCodeBase64(t.getQrPayload(), 220, 220);
                ticketsHtml.append(String.format("""
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); text-align:center;">
                        <div style="font-size:18px; font-weight:700; color:#1e293b; margin-bottom:4px;">%s</div>
                        <div style="font-size:13px; color:#64748b; margin-bottom:12px;">Mã vé: <span style="font-family:monospace; font-weight:bold; color:#2563eb; font-size:15px;">%s</span></div>
                        <div style="background:#f8fafc; display:inline-block; padding:12px; border-radius:8px; border:1px dashed #cbd5e1;">
                            <img src="%s" alt="QR Code Ticket" width="180" height="180" style="display:block; margin:0 auto;" />
                        </div>
                        <div style="margin-top:10px; font-size:12px; color:#94a3b8;">Xuất trình mã QR này tại quầy để check-in sự kiện</div>
                    </div>
                """, t.getTicketTypeName() != null ? t.getTicketTypeName() : "Vé vào cổng",
                     t.getTicketCode(),
                     qrBase64));
            }
        }

        String totalFormatted = CURRENCY_FORMATTER.format(booking.getTotalAmount());

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Vé điện tử EventHub</title></head>
            <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f1f5f9; margin:0; padding:30px 10px;">
                <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
                    <div style="background:linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); color:#ffffff; padding:32px 24px; text-align:center;">
                        <h1 style="margin:0 0 8px; font-size:26px; font-weight:800; letter-spacing:-0.5px;">EventHub</h1>
                        <p style="margin:0; font-size:16px; opacity:0.9;">Xác Nhận Đặt Vé & Vé Điện Tử</p>
                    </div>
                    
                    <div style="padding:28px 24px;">
                        <p style="font-size:16px; color:#334155; margin-top:0;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size:15px; color:#475569; line-height:1.6;">Đơn hàng của bạn cho sự kiện <strong>%s</strong> đã được thanh toán và xác nhận thành công. Dưới đây là thông tin chi tiết và vé điện tử check-in của bạn:</p>
                        
                        <div style="background:#f8fafc; border-radius:12px; padding:16px 20px; margin:20px 0; border-left:4px solid #2563eb;">
                            <div style="font-size:14px; color:#64748b; margin-bottom:6px;">Mã đơn hàng: <strong style="color:#0f172a;">%s</strong></div>
                            <div style="font-size:14px; color:#64748b; margin-bottom:6px;">Tổng thanh toán: <strong style="color:#16a34a; font-size:16px;">%s</strong></div>
                            <div style="font-size:14px; color:#64748b;">Số lượng vé: <strong style="color:#0f172a;">%d vé</strong></div>
                        </div>

                        <h3 style="color:#0f172a; font-size:18px; margin:28px 0 16px; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">Danh Sách Vé Của Bạn</h3>
                        %s

                        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px; margin-top:24px; color:#1e40af; font-size:13px; line-height:1.5;">
                            📌 <strong>Lưu ý quan trọng:</strong> Mỗi mã QR chỉ có giá trị check-in một lần duy nhất. Vui lòng bảo mật mã vé và không chia sẻ cho người khác.
                        </div>
                    </div>

                    <div style="background:#f8fafc; padding:20px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0;">
                        Cảm ơn bạn đã lựa chọn EventHub. Nếu có thắc mắc, vui lòng liên hệ <a href="mailto:support@eventhub.vn" style="color:#2563eb; text-decoration:none;">support@eventhub.vn</a>.<br>
                        © 2026 EventHub Inc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        """, customerName, eventTitle, booking.getId(), totalFormatted, tickets != null ? tickets.size() : 0, ticketsHtml.toString());
    }

    private String buildWaitlistOfferHtml(WaitlistOffer offer, String customerName, String eventTitle, String ticketTypeName) {
        String expiryStr = offer.getExpiresAt() != null ? DATE_TIME_FORMATTER.format(offer.getExpiresAt()) : "trong 15 phút tới";
        String eventLink = frontendUrl + "/events";

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Suất mua vé EventHub</title></head>
            <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f1f5f9; margin:0; padding:30px 10px;">
                <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
                    <div style="background:linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color:#ffffff; padding:28px 20px; text-align:center;">
                        <h1 style="margin:0 0 6px; font-size:24px; font-weight:800;">EventHub Waitlist</h1>
                        <p style="margin:0; font-size:15px; opacity:0.95;">Đã có vé trống dành riêng cho bạn!</p>
                    </div>
                    
                    <div style="padding:28px 24px;">
                        <p style="font-size:15px; color:#334155; margin-top:0;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size:14px; color:#475569; line-height:1.6;">Hệ thống phát hiện có vé khả dụng từ sự kiện <strong>%s</strong> mà bạn đã đăng ký danh sách chờ (Waitlist).</p>
                        
                        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:18px; margin:20px 0;">
                            <div style="font-size:15px; color:#92400e; font-weight:700; margin-bottom:8px;">Loại vé: %s</div>
                            <div style="font-size:14px; color:#b45309; margin-bottom:6px;">Số lượng: <strong>%d vé</strong></div>
                            <div style="font-size:14px; color:#b45309;">Thời hạn hoàn tất thanh toán: <strong style="color:#b91c1c;">%s</strong></div>
                        </div>

                        <p style="font-size:13px; color:#64748b; line-height:1.5;">Suất mua vé này sẽ tự động hủy và chuyển tiếp cho người xếp hàng kế tiếp nếu bạn không hoàn tất xác nhận trước thời hạn trên.</p>

                        <div style="text-align:center; margin:30px 0;">
                            <a href="%s" style="background:#2563eb; color:#ffffff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px; display:inline-block; box-shadow:0 4px 10px rgba(37,99,235,0.3);">Đặt & Thanh Toán Ngay</a>
                        </div>
                    </div>

                    <div style="background:#f8fafc; padding:18px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0;">
                        © 2026 EventHub Inc. Mọi thắc mắc vui lòng liên hệ support@eventhub.vn.
                    </div>
                </div>
            </body>
            </html>
        """, customerName, eventTitle, ticketTypeName, offer.getQuantity(), expiryStr, eventLink);
    }

    private String buildSingleTicketHtml(Ticket ticket, String customerName, String eventTitle, String ticketTypeName, String qrBase64) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Vé điện tử EventHub</title></head>
            <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f1f5f9; margin:0; padding:30px 10px;">
                <div style="max-width:540px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
                    <div style="background:linear-gradient(135deg, #2563eb 0%%, #1d4ed8 100%%); color:#ffffff; padding:24px; text-align:center;">
                        <h1 style="margin:0 0 6px; font-size:24px; font-weight:800;">EventHub</h1>
                        <p style="margin:0; font-size:15px; opacity:0.9;">Vé Điện Tử Của Bạn</p>
                    </div>
                    
                    <div style="padding:24px;">
                        <p style="font-size:15px; color:#334155;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size:14px; color:#475569;">Dưới đây là vé điện tử cho sự kiện <strong>%s</strong>:</p>

                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                            <div style="font-size:18px; font-weight:700; color:#1e293b; margin-bottom:4px;">%s</div>
                            <div style="font-size:13px; color:#64748b; margin-bottom:12px;">Mã vé: <span style="font-family:monospace; font-weight:bold; color:#2563eb; font-size:16px;">%s</span></div>
                            <div style="background:#f8fafc; display:inline-block; padding:12px; border-radius:8px; border:1px dashed #cbd5e1;">
                                <img src="%s" alt="QR Code Ticket" width="180" height="180" style="display:block; margin:0 auto;" />
                            </div>
                        </div>

                        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; color:#1e40af; font-size:12px; line-height:1.5;">
                            📌 Xuất trình mã QR tại cửa soát vé sự kiện để làm thủ tục check-in.
                        </div>
                    </div>

                    <div style="background:#f8fafc; padding:16px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0;">
                        © 2026 EventHub Inc. Hỗ trợ: support@eventhub.vn
                    </div>
                </div>
            </body>
            </html>
        """, customerName, eventTitle, ticketTypeName, ticket.getTicketCode(), qrBase64);
    }
}
