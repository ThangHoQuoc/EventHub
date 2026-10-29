package com.eventhub.eventhub_backend.notification;

import com.eventhub.eventhub_backend.booking.entity.Booking;
import com.eventhub.eventhub_backend.event.entity.Event;
import com.eventhub.eventhub_backend.notification.service.Impl.EmailServiceImpl;
import com.eventhub.eventhub_backend.notification.service.QRCodeService;
import com.eventhub.eventhub_backend.ticket.entity.TicketType;
import com.eventhub.eventhub_backend.ticketing.dto.response.TicketResponse;
import com.eventhub.eventhub_backend.ticketing.entity.Ticket;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistEntry;
import com.eventhub.eventhub_backend.waitlist.entity.WaitlistOffer;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Properties;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceImplTest {

    private final JavaMailSender javaMailSender = mock(JavaMailSender.class);
    private final QRCodeService qrCodeService = mock(QRCodeService.class);

    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailServiceImpl(javaMailSender, qrCodeService);
        ReflectionTestUtils.setField(emailService, "mailEnabled", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "no-reply@eventhub.vn");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");

        when(qrCodeService.generateQRCodeBase64(any(), anyInt(), anyInt()))
                .thenReturn("data:image/png;base64,mockQrCodeBase64String");

        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void sendTicketConfirmationEmail_whenMailDisabled_shouldLogMockEmailWithoutThrowing() {
        User customer = User.builder().email("buyer@gmail.com").fullName("Nguyen Van A").build();
        Booking booking = Booking.builder().customer(customer).totalAmount(BigDecimal.valueOf(250000)).build();
        booking.setId("booking-001");

        TicketResponse ticketResponse = TicketResponse.builder()
                .ticketCode("EVH-booking-001-1")
                .qrPayload("EVENTHUB|TICKET|EVH-booking-001-1")
                .ticketTypeName("VIP")
                .eventTitle("Tech Summit 2026")
                .build();

        emailService.sendTicketConfirmationEmail(booking, List.of(ticketResponse));

        verify(javaMailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendTicketConfirmationEmail_whenMailEnabled_shouldCallMailSender() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);

        User customer = User.builder().email("buyer@gmail.com").fullName("Nguyen Van A").build();
        Booking booking = Booking.builder().customer(customer).totalAmount(BigDecimal.valueOf(500000)).build();
        booking.setId("booking-002");

        TicketResponse ticketResponse = TicketResponse.builder()
                .ticketCode("EVH-booking-002-1")
                .qrPayload("EVENTHUB|TICKET|EVH-booking-002-1")
                .ticketTypeName("Standard")
                .eventTitle("Music Festival 2026")
                .build();

        emailService.sendTicketConfirmationEmail(booking, List.of(ticketResponse));

        verify(javaMailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendWaitlistOfferEmail_whenMailEnabled_shouldCallMailSender() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);

        User customer = User.builder().email("waitlist.user@gmail.com").fullName("Tran Thi B").build();
        Event event = Event.builder().title("Startup Workshop").build();
        TicketType ticketType = TicketType.builder().name("General Admission").event(event).build();
        WaitlistEntry entry = WaitlistEntry.builder().customer(customer).ticketType(ticketType).build();

        WaitlistOffer offer = WaitlistOffer.builder()
                .waitlistEntry(entry)
                .ticketType(ticketType)
                .quantity(2)
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
        offer.setId("offer-001");

        emailService.sendWaitlistOfferEmail(offer);

        verify(javaMailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendSingleTicketEmail_whenMailEnabled_shouldCallMailSender() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", true);

        User customer = User.builder().email("user@gmail.com").fullName("Le Van C").build();
        Event event = Event.builder().title("Art Exhibition").build();
        TicketType ticketType = TicketType.builder().name("VIP Early Bird").event(event).build();

        Ticket ticket = Ticket.builder()
                .ticketCode("EVH-SINGLE-TICKET-01")
                .qrPayload("EVENTHUB|TICKET|EVH-SINGLE-TICKET-01")
                .customer(customer)
                .ticketType(ticketType)
                .build();

        emailService.sendSingleTicketEmail(ticket);

        verify(javaMailSender, times(1)).send(any(MimeMessage.class));
    }
}
