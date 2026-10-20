const qrCells = [
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 1, 0, 1, 0, 1,
  1, 1, 1, 0, 0, 0, 1, 1, 1,
  0, 0, 0, 1, 1, 0, 0, 0, 0,
  1, 1, 0, 1, 0, 1, 1, 0, 1,
  0, 1, 1, 0, 1, 1, 0, 1, 0,
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 0, 1, 1, 1,
];

type QRCodeProps = {
  label?: string;
  className?: string;
};

export function QRCode({ className = "", label = "Mã QR" }: QRCodeProps) {
  return (
    <span className={`eh-qr-code ${className}`.trim()} aria-label={label} role="img">
      {qrCells.map((filled, index) => (
        <i className={filled ? "is-filled" : ""} key={index} />
      ))}
    </span>
  );
}

