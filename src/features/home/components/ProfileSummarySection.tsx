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
    <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#f97316_0%,#ea580c_48%,#7c2d12_100%)] p-5 text-white shadow-[0_20px_50px_rgba(194,65,12,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
            Student Mini App
          </span>
          <h2 className="mt-3 text-[24px] font-bold leading-[1.2]">
            Xin chào, {profile?.fullName || "học viên"}!
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {profile?.centerName || "Owlexa Center"}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-white/65">
            {todayLabel}
          </p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/15 text-xl font-bold backdrop-blur-sm">
          {profile?.fullName?.charAt(0)?.toUpperCase() || "H"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">
            Vai trò
          </p>
          <p className="mt-2 text-sm font-semibold">Học viên</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">
            Liên hệ
          </p>
          <p className="mt-2 truncate text-sm font-semibold">
            {profile?.phoneNumber || "Chưa cập nhật"}
          </p>
        </div>
      </div>
    </section>
  );
};
