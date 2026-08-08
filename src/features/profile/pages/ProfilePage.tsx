import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { userProfileAtom } from "@/core/auth/authStore";
import { authService } from "@/core/auth/authService";
import type { AccountResponse } from "@/core/auth/authTypes";

const profileRows = (user: AccountResponse | null) => [
  { label: "Họ và tên", value: user?.fullName || "Học viên" },
  { label: "Số điện thoại", value: user?.phoneNumber || "Chưa cập nhật" },
  { label: "Email", value: user?.email || "Chưa cập nhật" },
  { label: "Trung tâm", value: user?.centerName || "Owlexa Center" },
];

export const ProfilePage: React.FC = () => {
  const snapshotUser = useAtomValue(userProfileAtom);
  const [profile, setProfile] = useState<AccountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await httpClient.get<AccountResponse>("/account", {
          allowAuthReplay: true,
        });
        if (isMounted) {
          setProfile(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          const apiErr = err as AppApiError;
          setError(apiErr.message || "Không thể cập nhật hồ sơ mới nhất.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
      setShowConfirmLogout(false);
    }
  };

  const displayUser = profile || snapshotUser;

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <section className="rounded-[24px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_55%,#374151_100%)] p-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-2xl font-bold">
            {displayUser?.fullName?.charAt(0)?.toUpperCase() || "H"}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Tài khoản học viên
            </p>
            <h1 className="mt-1 truncate text-[24px] font-bold">
              {displayUser?.fullName || "Học viên"}
            </h1>
            <p className="mt-1 truncate text-sm text-white/75">
              {displayUser?.centerName || "Owlexa Center"}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}. Đang hiển thị dữ liệu snapshot tạm thời.
        </div>
      )}

      <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Hồ sơ
            </p>
            <h2 className="mt-1 text-base font-bold text-text-heading">
              Thông tin cá nhân
            </h2>
          </div>
          {isLoading && !displayUser && (
            <span className="text-xs font-medium text-text-muted">Đang tải...</span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {profileRows(displayUser as AccountResponse | null).map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-[18px] bg-surface-page px-4 py-3"
            >
              <span className="text-xs font-medium text-text-muted">{row.label}</span>
              <span className="ml-4 text-right text-sm font-semibold text-text-heading">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Phiên làm việc
        </p>
        <h2 className="mt-1 text-base font-bold text-text-heading">
          Đăng xuất tài khoản
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Đăng xuất sẽ kết thúc phiên hiện tại trên Zalo Mini App của học viên.
        </p>
        <button
          onClick={() => setShowConfirmLogout(true)}
          disabled={isLoggingOut}
          className="mt-4 w-full rounded-[16px] border border-error/20 bg-red-50 py-3 text-sm font-semibold text-error disabled:opacity-50"
        >
          {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
        </button>
      </section>

      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-[24px] bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-text-heading">Xác nhận đăng xuất</h3>
            <p className="mt-2 text-sm text-text-muted">
              Bạn có chắc chắn muốn đăng xuất khỏi Owlexa Student Mini App?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-[14px] border border-surface-border bg-white py-2.5 text-sm font-semibold text-text-body"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 rounded-[14px] bg-error py-2.5 text-sm font-semibold text-white"
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
