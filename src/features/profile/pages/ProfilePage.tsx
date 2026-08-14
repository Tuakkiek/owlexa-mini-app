import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import {
  User,
  Phone,
  Mail,
  Building,
  LogOut,
  TriangleAlert,
  Info,
} from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { userProfileAtom } from "@/core/auth/authStore";
import { authService } from "@/core/auth/authService";
import type { AccountResponse } from "@/core/auth/authTypes";

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

  const infoRows = [
    {
      label: "Họ và tên",
      value: displayUser?.fullName || "Học viên",
      icon: User,
    },
    {
      label: "Số điện thoại",
      value: displayUser?.phoneNumber || "Chưa cập nhật",
      icon: Phone,
    },
    {
      label: "Email",
      value: displayUser?.email || "Chưa cập nhật",
      icon: Mail,
    },
    {
      label: "Trung tâm học",
      value: displayUser?.centerName || "Owlexa Center",
      icon: Building,
    },
  ];

  return (
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="pt-2">
        <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          CÁ NHÂN
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
          Hồ sơ học viên
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">
          Quản lý thông tin tài khoản và phiên đăng nhập
        </p>
      </header>

      {/* Profile Card Hero */}
      <section className="flex items-center gap-4 rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-primary-light text-xl font-bold text-primary">
          {displayUser?.fullName?.charAt(0)?.toUpperCase() || "H"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-base font-bold text-text-heading">
              {displayUser?.fullName || "Học viên"}
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              Học viên
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

      {/* Personal Info Card */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary-light text-primary">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-text-heading">Thông tin cá nhân</h3>
          </div>
          {isLoading && !displayUser && (
            <span className="text-xs font-medium text-text-muted">Đang tải...</span>
          )}
        </div>

        <div className="space-y-2">
          {infoRows.map((row) => {
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
                  {row.value}
                </span>
              </div>
            );
          })}
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
