import { QRCodeSVG } from "qrcode.react";

type QRCodeProps = { value?: string; label?: string; className?: string };
export function QRCode({ value, className = "", label = "Mã QR vé" }: QRCodeProps) {
  if (!value) return <span>Chưa có mã QR.</span>;
  return <QRCodeSVG value={value} size={240} level="M" marginSize={4} role="img" aria-label={label} className={className} style={{ width: "100%", maxWidth: 280, height: "auto", display: "block", background: "white" }} />;
}
