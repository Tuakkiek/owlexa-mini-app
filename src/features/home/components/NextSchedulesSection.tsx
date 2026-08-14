import React from "react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import { getWeekdayInfo, type ScheduleResponse } from "@/features/schedule/scheduleTypes";

interface NextSchedulesSectionProps {
  schedules: ScheduleResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const NextSchedulesSection: React.FC<NextSchedulesSectionProps> = ({
  schedules,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const previewSchedules = schedules.slice(0, 3);

  return (
    <section className="rounded-[24px] border border-surface-border bg-surface-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Lịch học
          </p>
          <h3 className="mt-1 text-base font-bold text-text-heading">
            Ca học tiếp theo
          </h3>
        </div>
        <button
          onClick={() => navigate(PATHS.SCHEDULE)}
          className="rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary"
        >
          Xem tất cả
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-[84px] animate-pulse rounded-[20px] bg-surface-page"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          <p>{error}</p>
          <button onClick={onRetry} className="mt-3 font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : previewSchedules.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-dashed border-surface-border bg-surface-page px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-heading">
            Chưa có lịch học mới
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Khi trung tâm xếp lịch, ca học sẽ hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {previewSchedules.map((item) => (
            <article
              key={item.id}
              className="rounded-[20px] border border-surface-border bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                      {getWeekdayInfo(item.dayOfWeek).short}
                    </span>
                    <span className="text-[11px] font-medium text-text-muted">
                      {item.courseName || "Khóa học"}
                    </span>
                  </div>
                  <h4 className="mt-2 truncate text-sm font-bold text-text-heading">
                    {item.className}
                  </h4>
                  <p className="mt-1 text-xs text-text-muted">
                    Giáo viên: {item.teacherUserFullName || "Đang cập nhật"}
                  </p>
                </div>
                <div className="rounded-[16px] bg-white px-3 py-2 text-right shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    Giờ học
                  </p>
                  <p className="mt-1 text-sm font-bold text-text-heading">
                    {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-surface-border/70 pt-3 text-xs text-text-body">
                <span>Phòng: {item.roomName || "Chưa xếp phòng"}</span>
                <button
                  onClick={() => navigate(PATHS.SCHEDULE)}
                  className="font-semibold text-primary"
                >
                  Chi tiết
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
