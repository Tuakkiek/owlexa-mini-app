import React from "react";
import { WEEKDAYS_MAP, type DayOfWeek } from "../scheduleTypes";

interface WeekdaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
}

const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
      {DAYS_ORDER.map((day) => {
        const isSelected = day === selectedDay;
        const info = WEEKDAYS_MAP[day];

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            aria-pressed={isSelected}
            className={`min-w-16 rounded-btn border px-3 py-2 text-center transition-colors ${
              isSelected
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-surface-border bg-surface-card text-text-body"
            }`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em]">
              {info.short}
            </span>
            <span className={`mt-1 block text-[10px] ${isSelected ? "text-white/80" : "text-text-muted"}`}>
              {info.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
