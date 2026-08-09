import type { DayOfWeek, ScheduleResponse } from "@/core/auth/authTypes";

export type { DayOfWeek, ScheduleResponse };

const DAY_NUMBER_TO_KEY = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
} as const satisfies Record<number, DayOfWeek>;

export const WEEKDAYS_MAP: Record<DayOfWeek, { label: string; short: string }> = {
  MONDAY: { label: "Thứ Hai", short: "T2" },
  TUESDAY: { label: "Thứ Ba", short: "T3" },
  WEDNESDAY: { label: "Thứ Tư", short: "T4" },
  THURSDAY: { label: "Thứ Năm", short: "T5" },
  FRIDAY: { label: "Thứ Sáu", short: "T6" },
  SATURDAY: { label: "Thứ Bảy", short: "T7" },
  SUNDAY: { label: "Chủ Nhật", short: "CN" },
};

export const normalizeDayOfWeek = (day: string | number | null | undefined): DayOfWeek | null => {
  if (typeof day === "number") {
    return DAY_NUMBER_TO_KEY[day] ?? null;
  }

  if (typeof day !== "string") {
    return null;
  }

  const normalizedDay = day.trim().toUpperCase();
  if (normalizedDay in WEEKDAYS_MAP) {
    return normalizedDay as DayOfWeek;
  }

  const numericDay = Number(normalizedDay);
  if (Number.isInteger(numericDay)) {
    return DAY_NUMBER_TO_KEY[numericDay] ?? null;
  }

  return null;
};
