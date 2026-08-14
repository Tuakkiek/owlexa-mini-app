import React from "react";
import { Clock } from "lucide-react";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";

interface UpcomingScheduleItemProps {
  schedule: ScheduleResponse;
  index: number;
}

const getWeekdayLabel = (dayOfWeek?: string | number): string => {
  if (typeof dayOfWeek === "number") {
    const maps: Record<number, string> = {
      1: "TH 2",
      2: "TH 3",
      3: "TH 4",
      4: "TH 5",
      5: "TH 6",
      6: "TH 7",
      7: "CN",
    };
    return maps[dayOfWeek] || "TH";
  }

  const strMap: Record<string, string> = {
    MONDAY: "TH 2",
    TUESDAY: "TH 3",
    WEDNESDAY: "TH 4",
    THURSDAY: "TH 5",
    FRIDAY: "TH 6",
    SATURDAY: "TH 7",
    SUNDAY: "CN",
  };
  return strMap[String(dayOfWeek).toUpperCase()] || "TH";
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`;
  }
  try {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
};

export const UpcomingScheduleItem: React.FC<UpcomingScheduleItemProps> = ({
  schedule,
  index,
}) => {
  const weekday = getWeekdayLabel(schedule.dayOfWeek);
  const dateFormatted = formatDate(schedule.eventDate);

  const startTimeStr = schedule.startTime ? schedule.startTime.slice(0, 5) : "--:--";
  const endTimeStr = schedule.endTime ? schedule.endTime.slice(0, 5) : "--:--";
  const roomStr = schedule.roomName || "Chưa xếp phòng";

  // Semantic badge: First schedule item (closest) shows "Sắp diễn ra", subsequent shows "Đã lên lịch"
  const isSoon = index === 0;
  const statusLabel = isSoon ? "Sắp diễn ra" : "Đã lên lịch";
  const statusBadgeStyle = isSoon
    ? "bg-emerald-50 text-emerald-700"
    : "bg-blue-50 text-blue-700";

  const title = schedule.className || schedule.courseName || "Lớp học";

  return (
    <div className="flex items-center justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Date Block */}
        <div className="flex flex-col items-center justify-center rounded-[12px] bg-primary-light px-3 py-2 min-w-[56px] text-center shrink-0">
          <span className="text-[10px] font-bold uppercase text-primary">
            {weekday}
          </span>
          <span className="text-xs font-bold text-text-heading mt-0.5">
            {dateFormatted}
          </span>
        </div>

        {/* Schedule Info */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-heading truncate">{title}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-text-muted truncate">
            <Clock className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="truncate">
              {startTimeStr} – {endTimeStr} • {roomStr}
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0 ${statusBadgeStyle}`}
      >
        {statusLabel}
      </span>
    </div>
  );
};

export default UpcomingScheduleItem;
