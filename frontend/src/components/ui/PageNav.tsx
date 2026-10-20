export function PageNav({ page, totalPages, onChange, disabled }: { page: number; totalPages: number; onChange: (page: number) => void; disabled?: boolean }) {
  if (totalPages < 2) return null;
  return <nav className="ev-load-progress" aria-label="Phân trang">
    <button disabled={disabled || page === 0} onClick={() => onChange(page - 1)}>Trang trước</button>
    <span>Trang {page + 1} / {totalPages}</span>
    <button disabled={disabled || page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Trang sau</button>
  </nav>;
}
