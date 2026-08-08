import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

export type ErrorKind =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "REQUEST_ABORTED"
  | "UNKNOWN_ERROR";

export interface AppApiError {
  kind: ErrorKind;
  status: number | null;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  allowAuthReplay?: boolean;
  _retry?: boolean;
}

const isProduction = import.meta.env.PROD;
const envApiUrl = import.meta.env.VITE_API_URL;

if (isProduction && (!envApiUrl || envApiUrl.trim() === "")) {
  throw new Error(
    "VITE_API_URL environment variable is required in production environment.",
  );
}

export const BASE_URL = envApiUrl || "http://localhost:8081";

export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Dynamic getters/setters for memory state to avoid circular imports
let getAccessTokenFn: () => string | null = () => null;
let onSessionExpiredFn: () => void = () => {};
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AppApiError) => void;
}> = [];

export function setupHttpClient(config: {
  getAccessToken: () => string | null;
  onSessionExpired: () => void;
}) {
  getAccessTokenFn = config.getAccessToken;
  onSessionExpiredFn = config.onSessionExpired;
}

export function normalizeError(error: any): AppApiError {
  if (axios.isCancel(error) || error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
    return {
      kind: "REQUEST_ABORTED",
      status: null,
      message: "Yêu cầu đã bị hủy.",
    };
  }

  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return {
      kind: "TIMEOUT_ERROR",
      status: null,
      message: "Kết nối quá thời hạn (Timeout). Vui lòng kiểm tra lại mạng.",
    };
  }

  if (!error.response) {
    return {
      kind: "NETWORK_ERROR",
      status: null,
      message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.",
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  const message = data?.message || "Đã xảy ra lỗi hệ thống.";

  if (status === 401) {
    return { kind: "UNAUTHORIZED", status, message };
  }

  if (status === 403) {
    return { kind: "FORBIDDEN", status, message: "Bạn không có quyền thực hiện thao tác này." };
  }

  if (status === 400 && data?.errors) {
    return {
      kind: "VALIDATION_ERROR",
      status,
      message: data.message || "Dữ liệu nhập không hợp lệ.",
      fieldErrors: data.errors,
    };
  }

  if (status >= 500) {
    return { kind: "SERVER_ERROR", status, message: "Lỗi hệ thống máy chủ." };
  }

  return { kind: "UNKNOWN_ERROR", status, message };
}

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    // Selective credentials: withCredentials = true ONLY for auth-cookie URLs
    const isAuthCookieEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/logout");

    config.withCredentials = isAuthCookieEndpoint;

    const token = getAccessTokenFn();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeError(error)),
);

const processQueue = (error: AppApiError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function clearRequestQueue() {
  processQueue({
    kind: "UNAUTHORIZED",
    status: 401,
    message: "Phiên làm việc đã kết thúc.",
  });
}

// Response Interceptor
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(normalizeError(error));
    }

    const url = originalRequest.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/logout");

    // Do NOT auto-refresh for excluded auth endpoints or when replay is disallowed
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (originalRequest.allowAuthReplay === false) {
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes: AxiosResponse<{ auth: { accessToken: string } }> =
          await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true },
          );

        const newAccessToken = refreshRes.data?.auth?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return httpClient(originalRequest);
      } catch (refreshErr) {
        const normalized = normalizeError(refreshErr);
        processQueue(normalized);
        onSessionExpiredFn();
        return Promise.reject(normalized);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);
