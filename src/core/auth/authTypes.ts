export type AuthStateEnum =
  | "HYDRATING"
  | "GUEST"
  | "AUTHENTICATED_STUDENT"
  | "FORBIDDEN_ROLE"
  | "SESSION_EXPIRED"
  | "STORAGE_ERROR";

export type RoleName =
  | "ADMIN"
  | "OWNER"
  | "TEACHER"
  | "STUDENT"
  | "CASHIER"
  | "MANAGER"
  | "ACADEMIC_STAFF";

export interface LoginRequest {
  phoneNumber: string;
  password: string;
  deviceName?: string;
  deviceType?: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
}

export interface AuthResponse {
  accessToken: string;
  sessionId: string;
  phoneNumber: string;
  email: string | null;
  fullName: string;
  roleName: RoleName;
  centerName: string | null;
  centerId: number | null;
  permissions: string[];
}

export interface RefreshTokenResponse {
  refreshToken: string;
  auth: AuthResponse;
}

export interface UserInfo {
  userId?: number;
  phoneNumber: string;
  email: string | null;
  fullName: string;
  roleName: RoleName;
  centerName: string | null;
  centerId: number | null;
  permissions: string[];
}

export type AccountResponse = UserInfo;
