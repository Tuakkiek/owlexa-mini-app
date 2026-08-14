export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ScheduleResponse {
  id: number;
  classId: number;
  className: string;
  courseName?: string;
  centerId?: number;
  teacherUserId?: number;
  teacherUserFullName?: string;
  teacherPhoneNumber?: string;
  roomId?: number;
  roomName?: string;
  roomCode?: string;
  dayOfWeek: DayOfWeek | number;
  startTime: string;
  endTime: string;
  type?: string;
  eventDate?: string;
  lessonNumber?: number;
  eventStatus?: string;
  source?: string;
  createdAt?: string;
}

export const DAY_NUMBER_MAP: Record<DayOfWeek, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export const NUMBER_TO_DAY_MAP: Record<number, DayOfWeek> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
};

export const WEEKDAYS_MAP: Record<DayOfWeek, { label: string; short: string; dayNumber: number }> = {
  MONDAY: { label: "Thứ Hai", short: "T2", dayNumber: 1 },
  TUESDAY: { label: "Thứ Ba", short: "T3", dayNumber: 2 },
  WEDNESDAY: { label: "Thứ Tư", short: "T4", dayNumber: 3 },
  THURSDAY: { label: "Thứ Năm", short: "T5", dayNumber: 4 },
  FRIDAY: { label: "Thứ Sáu", short: "T6", dayNumber: 5 },
  SATURDAY: { label: "Thứ Bảy", short: "T7", dayNumber: 6 },
  SUNDAY: { label: "Chủ Nhật", short: "CN", dayNumber: 7 },
};

export const getWeekdayInfo = (day?: DayOfWeek | number | string) => {
  if (typeof day === "number") {
    const key = NUMBER_TO_DAY_MAP[day] || "MONDAY";
    return WEEKDAYS_MAP[key];
  }
  if (typeof day === "string") {
    const uppercaseKey = day.toUpperCase();
    if (uppercaseKey in WEEKDAYS_MAP) {
      return WEEKDAYS_MAP[uppercaseKey as DayOfWeek];
    }
    const num = Number(day);
    if (!isNaN(num) && num in NUMBER_TO_DAY_MAP) {
      return WEEKDAYS_MAP[NUMBER_TO_DAY_MAP[num]];
    }
  }
  return WEEKDAYS_MAP.MONDAY;
};

export const normalizeDayOfWeek = (day: string | number | null | undefined): DayOfWeek | null => {
  if (typeof day === "number") {
    return NUMBER_TO_DAY_MAP[day] ?? null;
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
    return NUMBER_TO_DAY_MAP[numericDay] ?? null;
  }

  return null;
};
