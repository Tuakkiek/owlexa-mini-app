import React, { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useNavigate } from "zmp-ui";
import { LoginForm } from "../components/LoginForm";
import { authStateAtom } from "@/core/auth/authStore";
import { PATHS } from "@/router/routes";

export const LoginPage: React.FC = () => {
  const authState = useAtomValue(authStateAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState === "AUTHENTICATED_STUDENT") {
      navigate(PATHS.HOME, { replace: true });
    }
  }, [authState, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_55%,#ffffff_100%)] px-4 py-8">
      <div className="w-full max-w-sm rounded-[28px] border border-surface-border bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-2xl font-bold text-white shadow-sm">
            O
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-heading">
            Owlexa Student
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Cổng thông tin dành cho học viên
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-surface-border pt-4 text-center">
          <p className="text-[11px] text-text-muted">
            Owlexa Design System v2.0 · Chăm sóc học viên
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
