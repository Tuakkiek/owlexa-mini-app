import React, { useState } from "react";
import { authService } from "@/core/auth/authService";
import type { AppApiError } from "@/core/api/httpClient";

export const LoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.login({
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        deviceType: "MOBILE",
      });
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = phoneNumber.trim().length > 0 && password.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[16px] border border-error/20 bg-red-50 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Số điện thoại
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Nhập số điện thoại"
          disabled={isLoading}
          className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          disabled={isLoading}
          className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none transition-colors focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="h-12 w-full rounded-[16px] bg-primary text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Đang đăng nhập...
          </span>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </form>
  );
};
