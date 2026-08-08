import type { DayOfWeek, ScheduleResponse } from "@/core/auth/authTypes";

export type { DayOfWeek, ScheduleResponse };

export const WEEKDAYS_MAP: Record<DayOfWeek, { label: string; short: string }> = {
  MONDAY: { label: "Thứ Hai", short: "T2" },
  TUESDAY: { label: "Thứ Ba", short: "T3" },
  WEDNESDAY: { label: "Thứ Tư", short: "T4" },
  THURSDAY: { label: "Thứ Năm", short: "T5" },
  FRIDAY: { label: "Thứ Sáu", short: "T6" },
  SATURDAY: { label: "Thứ Bảy", short: "T7" },
  SUNDAY: { label: "Chủ Nhật", short: "CN" },
};
