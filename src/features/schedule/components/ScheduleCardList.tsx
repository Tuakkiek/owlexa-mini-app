import React from "react";
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
            className="h-28 animate-pulse rounded-[22px] border border-surface-border bg-white p-4"
          />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-page text-xl">
          L
        </div>
        <p className="mt-4 text-sm font-semibold text-text-heading">
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
      {schedules.map((item) => (
        <article
          key={item.id}
          className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                {item.courseName || "Khóa học"}
              </span>
              <h3 className="mt-2 text-base font-bold text-text-heading">
                {item.className}
              </h3>
            </div>
            <div className="rounded-[16px] bg-surface-page px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                Giờ học
              </p>
              <p className="mt-1 text-sm font-bold text-text-heading">
                {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-surface-page px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                Giáo viên
              </p>
              <p className="mt-1 text-sm font-semibold text-text-heading">
                {item.teacherUserFullName || "Đang cập nhật"}
              </p>
            </div>
            <div className="rounded-[18px] bg-surface-page px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                Phòng học
              </p>
              <p className="mt-1 text-sm font-semibold text-text-heading">
                {item.roomName || "Chưa xếp phòng"}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
