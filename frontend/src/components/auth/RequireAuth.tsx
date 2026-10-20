import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RequestState } from "../ui/RequestState";

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, token, isLoading, profileError, refreshProfile } = useAuth();
  const location = useLocation();
  if (isLoading) return <RequestState loading />;
  if (token && profileError) return <RequestState error={profileError} onRetry={() => { void refreshProfile(); }} />;
  if (!user) return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
  if (roles && !roles.includes(user.role)) return <div className="notice" role="alert"><h1>Bạn không có quyền truy cập</h1><Link to="/">Về trang chủ</Link></div>;
  return children;
}
