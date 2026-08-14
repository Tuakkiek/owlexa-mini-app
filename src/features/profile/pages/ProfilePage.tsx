import React, { useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  User,
  Phone,
  Mail,
  Building,
  LogOut,
  Info,
  TriangleAlert,
  KeyRound,
  RotateCw,
  X,
} from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { userProfileAtom } from "@/core/auth/authStore";
import { authService } from "@/core/auth/authService";
import type { AccountResponse } from "@/core/auth/authTypes";
import type { ChangePasswordRequest, UpdateAccountRequest } from "../profileTypes";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  OWNER: "Chủ trung tâm",
  MANAGER: "Quản lý",
  ACADEMIC_STAFF: "Nhân viên học vụ",
  TEACHER: "Giáo viên",
  STUDENT: "Học viên",
  CASHIER: "Thu ngân",
};

const getInitial = (name?: string | null) => name?.trim().charAt(0).toUpperCase() || "H";

const profileRows = (user: AccountResponse | null) => [
  { label: "Họ và tên", value: user?.fullName || "Học viên", icon: User },
  { label: "Số điện thoại", value: user?.phoneNumber || "Chưa cập nhật", icon: Phone },
  { label: "Email", value: user?.email || "Chưa cập nhật", icon: Mail },
  { label: "Vai trò", value: roleLabels[user?.roleName || "STUDENT"] || user?.roleName || "Học viên", icon: User },
  { label: "Trung tâm", value: user?.centerName || "Owlexa Center", icon: Building },
];

export const ProfilePage: React.FC = () => {
  const snapshotUser = useAtomValue(userProfileAtom);
  const setSnapshotUser = useSetAtom(userProfileAtom);
  const [profile, setProfile] = useState<AccountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayUser = profile || snapshotUser;

  const syncProfile = (account: AccountResponse) => {
    setProfile(account);
    setSnapshotUser(account);
  };

  const fetchProfile = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<AccountResponse>("/account", {
        signal,
        allowAuthReplay: true,
      });
      syncProfile(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể cập nhật hồ sơ mới nhất.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, []);

  const startEditing = () => {
    setEditFullName(displayUser?.fullName || "");
    setEditEmail(displayUser?.email || "");
    setEditError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const fullName = editFullName.trim();
    const email = editEmail.trim();

    if (!fullName) {
      setEditError("Họ và tên không được để trống.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError("Email không hợp lệ.");
      return;
    }

    try {
      setIsSaving(true);
      setEditError(null);
      setSuccessMessage(null);
      const payload: UpdateAccountRequest = {
        fullName,
        email: email || null,
      };
      const res = await httpClient.put<AccountResponse>("/account", payload, {
        allowAuthReplay: true,
      });
      syncProfile(res.data);
      setIsEditing(false);
      setSuccessMessage("Cập nhật hồ sơ thành công.");
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setEditError(apiErr.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("Mật khẩu mới cần khác mật khẩu hiện tại.");
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      const payload: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };
      await httpClient.patch("/account/password", payload, {
        allowAuthReplay: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess("Đổi mật khẩu thành công.");
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setPasswordError(apiErr.message || "Không thể đổi mật khẩu.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
      setShowConfirmLogout(false);
    }
  };

  const hasProfile = Boolean(displayUser);
  const profileCompletion = useMemo(() => {
    const fields = [
      displayUser?.fullName,
      displayUser?.phoneNumber,
      displayUser?.email,
      displayUser?.centerName,
    ];
    const completed = fields.filter((value) => Boolean(value && String(value).trim())).length;
    return Math.round((completed / fields.length) * 100);
  }, [displayUser]);

  return (
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            CÁ NHÂN
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
            Hồ sơ học viên
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Quản lý thông tin tài khoản và phiên đăng nhập
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchProfile()}
          disabled={isLoading}
          aria-label="Làm mới"
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading shadow-sm transition-colors hover:bg-surface-hover active:bg-gray-100 disabled:opacity-50"
        >
          <RotateCw className={`h-5 w-5 text-gray-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Profile Card Hero */}
      <section className="flex items-center gap-4 rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-primary-light text-xl font-bold text-primary">
          {getInitial(displayUser?.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-base font-bold text-text-heading">
              {displayUser?.fullName || "Học viên"}
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              {roleLabels[displayUser?.roleName || "STUDENT"] || "Học viên"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted truncate">
            <Building className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="truncate">
              {displayUser?.centerName || "Owlexa Center"}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-[16px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <Info className="h-4 w-4 shrink-0" />
          <span>{error}. Đang hiển thị dữ liệu snapshot tạm thời.</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Personal Info Card */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary-light text-primary">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-text-heading">Thông tin cá nhân</h3>
          </div>
          {!isEditing && (
            <button
              onClick={startEditing}
              disabled={!hasProfile}
              className="rounded-[12px] border border-surface-border bg-white px-3 py-1 text-xs font-semibold text-text-heading hover:bg-surface-hover disabled:opacity-50"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Completion Bar */}
        <div className="rounded-[12px] bg-surface-page p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-text-muted">Hoàn thiện hồ sơ</span>
            <span className="text-xs font-bold text-primary">{isLoading && !hasProfile ? "..." : `${profileCompletion}%`}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-1">
            {editError && (
              <div className="rounded-[12px] border border-error/20 bg-red-50 p-3 text-xs text-error">
                {editError}
              </div>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-text-muted">Họ và tên</span>
              <input
                value={editFullName}
                onChange={(event) => setEditFullName(event.target.value)}
                className="mt-1 h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-xs font-medium text-text-heading outline-none focus:border-primary"
                placeholder="Nhập họ và tên"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-text-muted">Email</span>
              <input
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                className="mt-1 h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-xs font-medium text-text-heading outline-none focus:border-primary"
                placeholder="Nhập email"
              />
            </label>

            <div className="rounded-[12px] bg-surface-page px-3 py-2.5">
              <p className="text-[11px] font-semibold text-text-muted">Số điện thoại</p>
              <p className="mt-0.5 text-xs font-semibold text-text-heading">
                {displayUser?.phoneNumber || "Chưa cập nhật"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="rounded-[12px] border border-surface-border bg-white py-2 text-xs font-semibold text-text-heading hover:bg-surface-hover disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="rounded-[12px] bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {profileRows(displayUser as AccountResponse | null).map((row) => {
              const RowIcon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-[12px] bg-surface-page p-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-text-muted min-w-0">
                    <RowIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                    <span>{row.label}</span>
                  </div>
                  <span className="ml-3 truncate font-semibold text-text-heading text-right">
                    {isLoading && !hasProfile ? "..." : row.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Security Section */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary-light text-primary">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-heading">Mật khẩu</h3>
              <p className="text-[11px] text-text-muted">Đổi mật khẩu tài khoản</p>
            </div>
          </div>
          <button
            onClick={openPasswordModal}
            className="rounded-[12px] border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-text-heading hover:bg-surface-hover"
          >
            Đổi mật khẩu
          </button>
        </div>
      </section>

      {/* Account Session & Logout Card */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-surface-border/80 pb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-red-50 text-error">
            <LogOut className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-text-heading">Phiên làm việc</h3>
        </div>

        <p className="text-xs text-text-muted">
          Đăng xuất sẽ kết thúc phiên làm việc hiện tại trên Zalo Mini App của học viên.
        </p>

        <button
          type="button"
          onClick={() => setShowConfirmLogout(true)}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/20 bg-red-50 py-2.5 text-xs font-semibold text-error transition-colors hover:bg-red-100 active:bg-red-200 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? "Đang xử lý..." : "Đăng xuất tài khoản"}</span>
        </button>
      </section>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[16px] border border-surface-border bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  BẢO MẬT
                </span>
                <h3 className="text-base font-bold text-text-heading">
                  Đổi mật khẩu
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
                className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-surface-hover text-text-muted disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {passwordSuccess && (
              <div className="mt-3 rounded-[12px] border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mt-3 rounded-[12px] border border-error/20 bg-red-50 p-3 text-xs text-error">
                {passwordError}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-xs text-text-heading outline-none focus:border-primary"
                placeholder="Mật khẩu hiện tại"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-xs text-text-heading outline-none focus:border-primary"
                placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-xs text-text-heading outline-none focus:border-primary"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
                className="flex-1 rounded-[12px] border border-surface-border bg-white py-2 text-xs font-semibold text-text-heading hover:bg-surface-hover disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 rounded-[12px] bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Logout Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-[16px] border border-surface-border bg-white p-5 shadow-xl">
            <div className="flex items-center gap-2 text-error">
              <TriangleAlert className="h-5 w-5 shrink-0" />
              <h3 className="text-base font-bold text-text-heading">
                Xác nhận đăng xuất
              </h3>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Bạn có chắc chắn muốn đăng xuất khỏi Owlexa Student Mini App?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-[12px] border border-surface-border bg-white py-2 text-xs font-semibold text-text-heading transition-colors hover:bg-surface-hover"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 rounded-[12px] bg-error py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
