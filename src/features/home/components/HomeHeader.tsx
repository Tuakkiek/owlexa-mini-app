import React from "react";
import { User, Bell, Calendar } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import type { UserInfo } from "@/core/auth/authTypes";

interface HomeHeaderProps {
  user: UserInfo | null;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date());

  // Capitalize first letter of weekday (e.g., "Thứ năm, 13/08" -> "Thứ Năm, 13/08")
  const dateDisplay = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="pt-2">
      <div className="flex items-center justify-between">
        {/* <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          STUDENT MINI APP
        </span> */}
        {/* <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(PATHS.PROFILE)}
            aria-label="Cá nhân"
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading shadow-sm transition-colors hover:bg-surface-hover active:bg-gray-100"
          >
            <User className="h-5 w-5 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={() => navigate(PATHS.PROFILE)}
            aria-label="Thông báo"
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading shadow-sm transition-colors hover:bg-surface-hover active:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-700" />
          </button>
        </div> */}
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-heading">
          {user?.fullName || "Học viên"}
        </h1>
        <p className="mt-1 text-sm font-normal text-text-body">
          {user?.centerName || "Owlexa Central Branch"}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-text-body">
          <Calendar className="h-4 w-4 text-text-muted" />
          <span>{dateDisplay}</span>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
