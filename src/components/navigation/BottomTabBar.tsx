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
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-[520px] items-center justify-around gap-1 px-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className="flex min-h-12 flex-1 flex-col items-center justify-center py-1 outline-none transition-colors"
            >
              <div
                className={`flex h-9 w-12 items-center justify-center rounded-[12px] transition-colors ${
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
                className={`mt-0.5 text-xs ${
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
