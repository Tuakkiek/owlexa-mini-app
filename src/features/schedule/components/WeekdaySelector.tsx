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
            type="button"
            onClick={() => onSelectDay(day)}
            className={`min-w-[64px] shrink-0 rounded-[12px] border px-3 py-2 text-center transition-colors ${
              isSelected
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-surface-border bg-white text-text-body hover:bg-surface-hover active:bg-gray-100"
            }`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider">
              {info.short}
            </span>
            <span
              className={`mt-0.5 block text-[10px] ${
                isSelected ? "font-medium text-white/90" : "text-text-muted"
              }`}
            >
              {info.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WeekdaySelector;
