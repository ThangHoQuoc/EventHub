import { useEffect, useRef } from "react";
import { LineIcon } from "../ui/LineIcon";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TermsModal({ onClose, open }: TermsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => { event.preventDefault(); onClose(); };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog className="checkout-modal" onClose={onClose} ref={dialogRef}>
      <header><div><span>Thông tin mua vé</span><h2>Điều khoản và chính sách hoàn tiền</h2></div><button aria-label="Đóng" onClick={onClose} type="button"><LineIcon name="x" /></button></header>
      <div className="checkout-modal-content">
        <section><h3>1. Xác nhận đơn hàng</h3><p>Vé chỉ được xác nhận sau khi EventHub nhận được kết quả thanh toán thành công. Thông tin vé sẽ được gửi tới email người nhận.</p></section>
        <section><h3>2. Chính sách hoàn tiền</h3><p>Điều kiện hoàn tiền phụ thuộc vào chính sách của từng nhà tổ chức. Phí dịch vụ có thể không được hoàn lại khi sự kiện vẫn diễn ra đúng lịch.</p></section>
        <section><h3>3. Thay đổi sự kiện</h3><p>Nếu lịch hoặc địa điểm thay đổi, EventHub sẽ gửi thông báo qua email và cập nhật trong mục Vé của tôi.</p></section>
      </div>
      <button className="checkout-modal-confirm" onClick={onClose} type="button">Đã hiểu</button>
    </dialog>
  );
}

