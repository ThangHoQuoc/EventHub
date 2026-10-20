import { useEffect, useState } from "react";

// keys chứa các định danh đầu vào; thay đổi chúng sẽ tải lại tài nguyên.
export function useApiResource<T>(load: () => Promise<T>, keys: unknown[] = []) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setData(undefined);
    load().then(result => { if (active) setData(result); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "Không thể tải dữ liệu."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [...keys, revision]);
  return { data, loading, error, reload: () => setRevision(n => n + 1), setData };
}
