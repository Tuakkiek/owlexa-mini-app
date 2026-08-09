import React, { useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
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
  { label: "Họ và tên", value: user?.fullName || "Học viên" },
  { label: "Số điện thoại", value: user?.phoneNumber || "Chưa cập nhật" },
  { label: "Email", value: user?.email || "Chưa cập nhật" },
  { label: "Vai trò", value: roleLabels[user?.roleName || "STUDENT"] || user?.roleName || "Học viên" },
  { label: "Trung tâm", value: user?.centerName || "Owlexa Center" },
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
    <div className="mx-auto w-full max-w-[520px] space-y-5 px-4 pb-6 pt-4">
      <section className="rounded-card border border-surface-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-2xl font-semibold text-primary">
              {getInitial(displayUser?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Tài khoản học viên
              </p>
              <h1 className="mt-1 truncate text-2xl font-semibold text-text-heading">
                {displayUser?.fullName || "Học viên"}
              </h1>
              <p className="mt-1 truncate text-sm text-text-body">
                {displayUser?.centerName || "Owlexa Center"}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchProfile()}
            disabled={isLoading}
            className="min-h-10 rounded-btn border border-surface-border bg-white px-3 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            {isLoading ? "Đang tải" : "Làm mới"}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}. Đang hiển thị dữ liệu snapshot tạm thời.
        </div>
      )}

      {successMessage && (
        <div className="rounded-card border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="rounded-card border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Hồ sơ
            </p>
            <h2 className="mt-1 text-base font-bold text-text-heading">
              Thông tin cá nhân
            </h2>
          </div>
          {!isEditing && (
            <button
              onClick={startEditing}
              disabled={!hasProfile}
              className="rounded-btn border border-surface-border bg-white px-4 py-2 text-sm font-semibold text-text-body disabled:opacity-50"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="mt-4 rounded-btn bg-surface-page p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-text-muted">Hoàn thiện hồ sơ</span>
            <span className="text-sm font-bold text-primary">{isLoading && !hasProfile ? "..." : `${profileCompletion}%`}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            {editError && (
              <div className="rounded-card border border-error/20 bg-red-50 p-3 text-sm text-error">
                {editError}
              </div>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-text-muted">Họ và tên</span>
              <input
                value={editFullName}
                onChange={(event) => setEditFullName(event.target.value)}
                className="mt-1 h-12 w-full rounded-btn border border-surface-border bg-white px-4 text-sm font-medium text-text-heading outline-none focus:border-primary"
                placeholder="Nhập họ và tên"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-text-muted">Email</span>
              <input
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                className="mt-1 h-12 w-full rounded-btn border border-surface-border bg-white px-4 text-sm font-medium text-text-heading outline-none focus:border-primary"
                placeholder="Nhập email"
              />
            </label>

            <div className="rounded-btn bg-surface-page px-4 py-3">
              <p className="text-xs font-semibold text-text-muted">Số điện thoại</p>
              <p className="mt-1 text-sm font-semibold text-text-heading">
                {displayUser?.phoneNumber || "Chưa cập nhật"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="min-h-12 rounded-btn border border-surface-border bg-white px-4 text-sm font-semibold text-text-body disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="min-h-12 rounded-btn bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {profileRows(displayUser as AccountResponse | null).map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 rounded-btn bg-surface-page px-4 py-3"
              >
                <span className="text-xs font-medium text-text-muted">{row.label}</span>
                <span className="min-w-0 text-right text-sm font-semibold text-text-heading">
                  {isLoading && !hasProfile ? "..." : row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-card border border-surface-border bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Bảo mật
        </p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-text-heading">Mật khẩu</h2>
            <p className="mt-1 text-sm text-text-muted">
              Mật khẩu mới cần có ít nhất 8 ký tự.
            </p>
          </div>
          <button
            onClick={openPasswordModal}
            className="shrink-0 rounded-btn border border-surface-border bg-white px-4 py-2 text-sm font-semibold text-text-body"
          >
            Đổi
          </button>
        </div>
      </section>

      <section className="rounded-card border border-surface-border bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Phiên làm việc
        </p>
        <h2 className="mt-1 text-base font-bold text-text-heading">
          Đăng xuất tài khoản
        </h2>
        <button
          onClick={() => setShowConfirmLogout(true)}
          disabled={isLoggingOut}
          className="mt-4 w-full rounded-btn border border-error/20 bg-red-50 py-3 text-sm font-semibold text-error disabled:opacity-50"
        >
          {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
        </button>
      </section>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center">
          <div className="w-full max-w-sm rounded-card bg-white p-5 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Bảo mật
                </p>
                <h3 className="mt-1 text-lg font-bold text-text-heading">
                  Đổi mật khẩu
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border text-text-muted disabled:opacity-50"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {passwordSuccess && (
              <div className="mt-4 rounded-card border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mt-4 rounded-card border border-error/20 bg-red-50 p-3 text-sm text-error">
                {passwordError}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-12 w-full rounded-btn border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
                placeholder="Mật khẩu hiện tại"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-12 w-full rounded-btn border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
                placeholder="Mật khẩu mới"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="h-12 w-full rounded-btn border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isChangingPassword}
                className="min-h-12 rounded-btn border border-surface-border bg-white px-4 text-sm font-semibold text-text-body disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="min-h-12 rounded-btn bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-card bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-text-heading">Xác nhận đăng xuất</h3>
            <p className="mt-2 text-sm text-text-muted">
              Bạn có chắc chắn muốn đăng xuất khỏi Owlexa Student Mini App?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-btn border border-surface-border bg-white py-2.5 text-sm font-semibold text-text-body"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 rounded-btn bg-error py-2.5 text-sm font-semibold text-white"
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
