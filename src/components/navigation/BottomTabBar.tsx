import React from "react";
import { useLocation, useNavigate } from "zmp-ui";
import { Home, CalendarDays, CircleCheck, Wallet, User, type LucideIcon } from "lucide-react";
import { PATHS } from "@/router/routes";

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const tabs: Array<{ key: string; label: string; path: string; icon: LucideIcon }> = [
    {
      key: "home",
      label: "Trang chủ",
      path: PATHS.HOME,
      icon: Home,
    },
    {
      key: "schedule",
      label: "Lịch học",
      path: PATHS.SCHEDULE,
      icon: CalendarDays,
    },
    {
      key: "attendance",
      label: "Điểm danh",
      path: PATHS.ATTENDANCE,
      icon: CircleCheck,
    },
    {
      key: "fees",
      label: "Học phí",
      path: PATHS.FEES,
      icon: Wallet,
    },
    {
      key: "profile",
      label: "Cá nhân",
      path: PATHS.PROFILE,
      icon: User,
    },
  ];

  return (
    <nav
      className="shrink-0 z-30 border-t border-surface-border bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[60px] max-w-[520px] items-center justify-around gap-1 px-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              className="flex flex-1 flex-col items-center justify-center py-1 outline-none transition-colors"
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-[12px] transition-all ${
                  isActive ? "bg-primary-light" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-primary" : "text-text-muted"
                  }`}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`mt-0.5 text-[11px] ${
                  isActive ? "font-semibold text-primary" : "font-medium text-text-muted"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
