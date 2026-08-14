import React from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";
import { UpcomingScheduleItem } from "./UpcomingScheduleItem";

interface UpcomingScheduleSectionProps {
  schedules: ScheduleResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const UpcomingScheduleSection: React.FC<UpcomingScheduleSectionProps> = ({
  schedules,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const upcomingSchedules = schedules.slice(0, 2);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-heading">Lịch học sắp tới</h2>
        <button
          type="button"
          onClick={() => navigate(PATHS.SCHEDULE)}
          className="text-xs font-semibold text-primary transition-opacity hover:opacity-80 hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {isLoading ? (
        <div className="mt-3 space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-[76px] animate-pulse rounded-[16px] bg-surface-hover"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-3 rounded-[16px] border border-error/20 bg-red-50 p-4 text-xs text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      ) : upcomingSchedules.length === 0 ? (
        <div className="mt-3 rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-8 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
            <CalendarDays className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-heading">
            Chưa có lịch học sắp tới
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Các buổi học mới sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {upcomingSchedules.map((item, idx) => (
            <UpcomingScheduleItem key={item.id || idx} schedule={item} index={idx} />
          ))}
        </div>
      )}
    </section>
  );
};

export default UpcomingScheduleSection;
