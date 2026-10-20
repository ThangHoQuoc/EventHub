export function RequestState({ loading, error, onRetry }: { loading?: boolean; error?: string; onRetry?: () => void }) {
  if (loading) return <p className="notice" role="status">Đang tải dữ liệu…</p>;
  if (!error) return null;
  return <div className="notice" role="alert"><p>{error}</p>{onRetry && <button className="btn btn-secondary" type="button" onClick={onRetry}>Thử lại</button>}</div>;
}
