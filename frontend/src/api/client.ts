const TOKEN_KEY = "eventhub_access_token";

export class ApiError extends Error {
  code?: number;
  status: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = authenticated ? getToken() : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    let errorMessage = "Đã có lỗi xảy ra, vui lòng thử lại.";
    let errorCode: number | undefined;

    if (isJson) {
      try {
        const errorData = await response.json();
        errorCode = errorData.code;
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback
      }
    } else {
      errorMessage = (await response.text()) || response.statusText;
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (isJson) {
    const data: ApiResponse<T> = await response.json();
    // Backend Spring Boot trả về cấu trúc chuẩn: { code: 1000, message: "...", result: T }
    if (data.code !== undefined && data.result !== undefined) {
      return data.result;
    }
    return data as unknown as T;
  }

  return (await response.text()) as unknown as T;
}
