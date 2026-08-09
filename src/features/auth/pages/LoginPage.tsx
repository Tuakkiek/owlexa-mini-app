import React, { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { Card } from "@/components/ui/Card";
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
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-8">
      <Card elevated className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-btn bg-primary text-lg font-semibold text-white">
            O
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-text-heading">
            Owlexa Student
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Cổng thông tin dành cho học viên
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-surface-border pt-4 text-center">
          <p className="text-xs text-text-muted">
            Owlexa Design System v2.0 · Chăm sóc học viên
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
