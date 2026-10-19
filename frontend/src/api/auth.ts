import { fetchApi } from "./client";

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: "CUSTOMER" | "ORGANIZER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  createdAt?: string;
  updatedAt?: string;
}

export async function registerApi(payload: RegisterPayload): Promise<RegisterResult> {
  return fetchApi<RegisterResult>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginApi(payload: LoginPayload): Promise<LoginResult> {
  return fetchApi<LoginResult>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserApi(): Promise<UserProfile> {
  return fetchApi<UserProfile>("/api/v1/users/me", {
    method: "GET",
  });
}
