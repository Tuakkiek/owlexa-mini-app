import React from "react";
import { Clock, User, MapPin, CalendarDays } from "lucide-react";
import type { ScheduleResponse } from "../scheduleTypes";

interface ScheduleCardListProps {
  schedules: ScheduleResponse[];
  isLoading: boolean;
}

export const ScheduleCardList: React.FC<ScheduleCardListProps> = ({
  schedules,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="h-[110px] animate-pulse rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
          <CalendarDays className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-text-heading">
          Không có ca học nào trong ngày đã chọn
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Hãy chuyển sang ngày khác để xem thời khóa biểu trong tuần.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((item) => {
        const startTimeStr = item.startTime ? item.startTime.slice(0, 5) : "--:--";
        const endTimeStr = item.endTime ? item.endTime.slice(0, 5) : "--:--";

        return (
          <article
            key={item.id}
            className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {item.courseName || "Khóa học"}
                </span>
                <h3 className="mt-2 text-base font-bold text-text-heading truncate">
                  {item.className}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-[12px] bg-surface-page px-3 py-2 text-right shrink-0">
                <Clock className="h-4 w-4 text-text-muted" />
                <span className="text-xs font-bold text-text-heading">
                  {startTimeStr} - {endTimeStr}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-[12px] bg-surface-page px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase text-text-muted">
                    Giáo viên
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-text-heading">
                    {item.teacherUserFullName || "Đang cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-[12px] bg-surface-page px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-text-muted shadow-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase text-text-muted">
                    Phòng học
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-text-heading">
                    {item.roomName || "Chưa xếp phòng"}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ScheduleCardList;
