import React from "react";
import { useLocation, useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const tabs = [
    {
      key: "home",
      label: "Trang chủ",
      path: PATHS.HOME,
      icon: (active: boolean) => (
        <svg
          className={`h-6 w-6 ${active ? "text-primary" : "text-text-muted"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      key: "schedule",
      label: "Lịch học",
      path: PATHS.SCHEDULE,
      icon: (active: boolean) => (
        <svg
          className={`h-6 w-6 ${active ? "text-primary" : "text-text-muted"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      key: "attendance",
      label: "Điểm danh",
      path: PATHS.ATTENDANCE,
      icon: (active: boolean) => (
        <svg
          className={`h-6 w-6 ${active ? "text-primary" : "text-text-muted"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      key: "fees",
      label: "Học phí",
      path: PATHS.FEES,
      icon: (active: boolean) => (
        <svg
          className={`h-6 w-6 ${active ? "text-primary" : "text-text-muted"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      key: "profile",
      label: "Cá nhân",
      path: PATHS.PROFILE,
      icon: (active: boolean) => (
        <svg
          className={`h-6 w-6 ${active ? "text-primary" : "text-text-muted"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
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

          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? "page" : undefined}
              className="flex min-h-12 flex-1 flex-col items-center justify-center py-1 outline-none transition-colors"
            >
              <div
                className={`flex h-10 w-12 items-center justify-center rounded-btn transition-colors ${
                  isActive ? "bg-primary-light" : "bg-transparent"
                }`}
              >
                {tab.icon(isActive)}
              </div>
              <span
                className={`mt-0.5 text-xs font-medium ${
                  isActive ? "text-primary" : "text-text-muted"
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
