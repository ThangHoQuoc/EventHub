import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getCurrentUserApi,
  loginApi,
  registerApi,
  type LoginPayload,
  type RegisterPayload,
  type RegisterResult,
  type UserProfile,
} from "../api/auth";
import { ApiError, getToken, removeToken, setToken } from "../api/client";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  profileError: string;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState("");
  const requestVersion = useRef(0);

  const fetchProfile = async () => {
    const version = ++requestVersion.current;
    setIsLoading(true); setProfileError("");
    try {
      const profile = await getCurrentUserApi();
      if (version !== requestVersion.current) return;
      setUser(profile);
    } catch (error) {
      if (version !== requestVersion.current) return;
      if (error instanceof ApiError && error.status === 401) {
        removeToken(); setTokenState(null); setUser(null);
      } else {
        setProfileError(error instanceof Error ? error.message : "Không thể tải thông tin tài khoản.");
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    try {
      const result = await loginApi(payload);
      if (version !== requestVersion.current) return;
      setToken(result.accessToken);
      setTokenState(result.accessToken);
      setProfileError("");
      const profile = await getCurrentUserApi();
      if (version !== requestVersion.current) return;
      setUser(profile);
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    return registerApi(payload);
  };

  const logout = () => {
    ++requestVersion.current;
    setProfileError(""); setIsLoading(false);
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        profileError,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
