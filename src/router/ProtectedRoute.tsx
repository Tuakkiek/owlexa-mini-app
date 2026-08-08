import React, { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useNavigate } from "zmp-ui";
import { authStateAtom } from "@/core/auth/authStore";
import { PATHS } from "./routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authState = useAtomValue(authStateAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState === "GUEST" || authState === "SESSION_EXPIRED") {
      navigate(PATHS.LOGIN);
    }
  }, [authState, navigate]);

  if (authState === "HYDRATING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-text-body">
            Đang tải dữ liệu phiên làm việc...
          </p>
        </div>
      </div>
    );
  }

  if (authState === "STORAGE_ERROR") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page px-6 text-center">
        <div className="w-full max-w-sm rounded-[24px] border border-surface-border bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-error">
            !
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-heading">
            Lỗi bộ lưu trữ
          </h2>
          <p className="mt-2 text-sm text-text-body">
            Không thể khởi tạo bộ lưu trữ di động. Vui lòng thử lại.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-[16px] bg-primary py-2.5 text-sm font-semibold text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (authState === "FORBIDDEN_ROLE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page px-6 text-center">
        <div className="w-full max-w-sm rounded-[24px] border border-surface-border bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-warning">
            X
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-heading">
            Truy cập bị từ chối
          </h2>
          <p className="mt-2 text-sm text-text-body">
            Ứng dụng Zalo Mini App chỉ hỗ trợ vai trò học viên. Tài khoản của bạn thuộc vai trò khác.
          </p>
          <button
            onClick={() => navigate(PATHS.LOGIN)}
            className="mt-6 w-full rounded-[16px] bg-primary py-2.5 text-sm font-semibold text-white"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (authState === "GUEST" || authState === "SESSION_EXPIRED") {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
