import React from "react";
import { Clock, User, MapPin, CalendarDays } from "lucide-react";
import { WEEKDAYS_MAP, type DayOfWeek, type ScheduleResponse } from "../scheduleTypes";

export type DaySection = {
  day: DayOfWeek;
  date: Date;
  schedules: ScheduleResponse[];
};

interface ScheduleCardListProps {
  sections: DaySection[];
  isLoading: boolean;
  emptyMessage: string;
}

const TYPE_BADGE: Record<string, string> = {
  THEORY_CLASS: "bg-primary-light text-primary",
  ONLINE_CLASS: "bg-sky-50 text-sky-700",
  EXAM: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const TYPE_LABELS: Record<string, string> = {
  THEORY_CLASS: "Lịch học",
  ONLINE_CLASS: "Học online",
  EXAM: "Lịch thi",
  CANCELLED: "Đã hủy",
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

const minutesOf = (time: string) => {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
};

const periodLabel = (schedule: ScheduleResponse) => {
  const start = minutesOf(schedule.startTime);
  const end = minutesOf(schedule.endTime);
  const isMorning = start < 12 * 60;
  const isAfternoon = start >= 12 * 60 && start < 18 * 60;
  const base = isMorning ? 7 * 60 : isAfternoon ? 13 * 60 : 18 * 60;
  const offset = isMorning ? 1 : isAfternoon ? 6 : 9;
  const startPeriod = Math.max(offset, Math.floor((start - base) / 50) + offset);
  const endPeriod = Math.max(startPeriod, Math.ceil((end - base) / 50) + offset - 1);
  return `Tiết ${startPeriod} - ${endPeriod}`;
};

export const ScheduleCardList: React.FC<ScheduleCardListProps> = ({
  sections,
  isLoading,
  emptyMessage,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="rounded-card border border-surface-border bg-white p-4 shadow-sm"
          >
            <div className="h-5 w-28 animate-pulse rounded bg-surface-page" />
            <div className="mt-4 h-36 animate-pulse rounded-card bg-surface-page" />
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
          <CalendarDays className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-text-heading">
          Chưa có lịch trong tuần này
        </p>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section
          key={`${section.day}-${formatDate(section.date)}`}
          className="rounded-card border border-surface-border bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-heading">
              {WEEKDAYS_MAP[section.day]?.label || section.day}
            </h2>
            <span className="text-sm text-text-muted">{formatDate(section.date)}</span>
          </div>

          <div className="space-y-3">
            {section.schedules.map((item) => (
              <article
                key={item.id}
                className="rounded-card border border-surface-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-text-heading truncate">
                      {item.className}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      {item.lessonNumber ? `Lesson #${item.lessonNumber}` : `Lớp #${item.classId}`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      TYPE_BADGE[item.type || ""] ?? "bg-primary-light text-primary"
                    }`}
                  >
                    {TYPE_LABELS[item.type || ""] ?? "Lịch học"}
                  </span>
                </div>

                <div className="mt-3 rounded-card border border-surface-border bg-surface-page px-4 py-3">
                  <p className="text-sm font-semibold text-text-heading">
                    {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{periodLabel(item)}</p>
                </div>

                <div className="mt-4 space-y-2 border-t border-surface-border pt-3 text-xs text-text-body">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Khóa học: {item.courseName || "Đang cập nhật"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>Phòng: {item.roomName || "Chưa xếp phòng"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <span>GV: {item.teacherUserFullName || "Đang cập nhật"}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ScheduleCardList;
