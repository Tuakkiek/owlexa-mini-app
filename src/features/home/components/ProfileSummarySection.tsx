import React from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/core/auth/authStore";

export const ProfileSummarySection: React.FC = () => {
  const profile = useAtomValue(userProfileAtom);
  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date());

  return (
    <section className="rounded-card border border-surface-border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
            Student Mini App
          </span>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-text-heading">
            {profile?.fullName || "học viên"}
          </h2>
          <p className="mt-1 text-sm text-text-body">
            {profile?.centerName || "Owlexa Center"}
          </p>
          <p className="mt-4 text-xs font-medium text-text-muted">
            {todayLabel}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-lg font-semibold text-primary">
          {profile?.fullName?.charAt(0)?.toUpperCase() || "H"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-border pt-4">
        <div>
          <p className="text-xs text-text-muted">
            Vai trò
          </p>
          <p className="mt-1 text-sm font-medium text-text-heading">Học viên</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">
            Liên hệ
          </p>
          <p className="mt-1 truncate text-sm font-medium text-text-heading">
            {profile?.phoneNumber || "Chưa cập nhật"}
          </p>
        </div>
      </div>
    </section>
  );
};
