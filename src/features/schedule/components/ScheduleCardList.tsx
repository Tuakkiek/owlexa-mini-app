import React from "react";
import { WEEKDAYS_MAP, type DayOfWeek, type ScheduleResponse } from "../scheduleTypes";

type DaySection = {
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

const Icon = ({
  type,
  className = "h-4 w-4",
}: {
  type: "clock" | "pin" | "teacher";
  className?: string;
}) => {
  if (type === "clock") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }

  if (type === "pin") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
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
      <div className="rounded-card border border-dashed border-surface-border bg-white px-4 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-page text-xl text-text-muted">
          L
        </div>
        <p className="mt-4 text-sm font-semibold text-text-heading">
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
              {WEEKDAYS_MAP[section.day].label}
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
                    <h3 className="text-[18px] font-semibold leading-6 text-text-heading">
                      {item.className}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {item.lessonNumber ? `Lesson #${item.lessonNumber}` : `Lớp #${item.classId}`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      TYPE_BADGE[item.type] ?? "bg-surface-page text-text-body"
                    }`}
                  >
                    {TYPE_LABELS[item.type] ?? "Lịch học"}
                  </span>
                </div>

                <div className="mt-3 rounded-card border border-surface-border bg-surface-page px-4 py-3">
                  <p className="text-sm font-semibold text-text-heading">
                    {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{periodLabel(item)}</p>
                </div>

                <div className="mt-4 space-y-2 border-t border-surface-border pt-3 text-sm text-text-body">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">
                      <Icon type="clock" />
                    </span>
                    {item.courseName || "Khóa học"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">
                      <Icon type="pin" />
                    </span>
                    Phòng: {item.roomName || "Chưa xếp phòng"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">
                      <Icon type="teacher" />
                    </span>
                    GV: {item.teacherUserFullName || "Đang cập nhật"}
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
