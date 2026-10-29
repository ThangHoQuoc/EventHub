package com.eventhub.eventhub_backend.notification;

import com.eventhub.eventhub_backend.notification.service.Impl.QRCodeServiceImpl;
import com.eventhub.eventhub_backend.notification.service.QRCodeService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QRCodeServiceImplTest {

    private final QRCodeService qrCodeService = new QRCodeServiceImpl();

    @Test
    void generateQRCodeImage_shouldReturnNonEmptyByteArray() {
        String payload = "EVENTHUB|TICKET|EVH-BOOKING-001-1";
        byte[] bytes = qrCodeService.generateQRCodeImage(payload, 200, 200);

        assertThat(bytes).isNotNull();
        assertThat(bytes.length).isGreaterThan(100);
    }

    @Test
    void generateQRCodeBase64_shouldReturnValidDataUri() {
        String payload = "EVENTHUB|TICKET|EVH-BOOKING-001-2";
        String base64 = qrCodeService.generateQRCodeBase64(payload, 200, 200);

        assertThat(base64).isNotNull();
        assertThat(base64).startsWith("data:image/png;base64,");
        assertThat(base64.length()).isGreaterThan(50);
    }

    @Test
    void generateQRCodeImage_shouldThrowExceptionWhenPayloadIsBlank() {
        assertThatThrownBy(() -> qrCodeService.generateQRCodeImage("", 200, 200))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("blank");

        assertThatThrownBy(() -> qrCodeService.generateQRCodeImage(null, 200, 200))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
