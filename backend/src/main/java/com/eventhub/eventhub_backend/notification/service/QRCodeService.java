package com.eventhub.eventhub_backend.notification.service;

public interface QRCodeService {

    /**
     * Sinh ảnh QR Code dưới dạng mảng byte PNG.
     *
     * @param payload Chuỗi dữ liệu mã hóa trong QR Code (ví dụ ticketCode)
     * @param width   Chiều rộng ảnh (pixel)
     * @param height  Chiều cao ảnh (pixel)
     * @return Mảng byte của ảnh PNG
     */
    byte[] generateQRCodeImage(String payload, int width, int height);

    /**
     * Sinh ảnh QR Code dưới dạng chuỗi Data URI Base64 ("data:image/png;base64,...").
     *
     * @param payload Chuỗi dữ liệu mã hóa trong QR Code
     * @param width   Chiều rộng ảnh (pixel)
     * @param height  Chiều cao ảnh (pixel)
     * @return Chuỗi Data URI Base64 có thể chèn trực tiếp vào thẻ HTML <img src="...">
     */
    String generateQRCodeBase64(String payload, int width, int height);
}
