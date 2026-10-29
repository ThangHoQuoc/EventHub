package com.eventhub.eventhub_backend.notification.service.Impl;

import com.eventhub.eventhub_backend.notification.service.QRCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Service
public class QRCodeServiceImpl implements QRCodeService {

    @Override
    public byte[] generateQRCodeImage(String payload, int width, int height) {
        if (payload == null || payload.trim().isEmpty()) {
            throw new IllegalArgumentException("QR payload must not be blank");
        }

        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(payload, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate QR Code image for payload: {}", payload, e);
            throw new IllegalStateException("Failed to generate QR Code image", e);
        }
    }

    @Override
    public String generateQRCodeBase64(String payload, int width, int height) {
        byte[] imageBytes = generateQRCodeImage(payload, width, height);
        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        return "data:image/png;base64," + base64;
    }
}
