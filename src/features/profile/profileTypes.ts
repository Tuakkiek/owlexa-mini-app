import type { AccountResponse } from "@/core/auth/authTypes";

export type ProfileData = AccountResponse;

export interface UpdateAccountRequest {
  fullName: string;
  email: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
