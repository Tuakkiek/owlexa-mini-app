import React, { useCallback, useEffect, useMemo, useState } from "react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { ScheduleCardList } from "../components/ScheduleCardList";
import {
  WEEKDAYS_MAP,
  normalizeDayOfWeek,
  type DayOfWeek,
  type ScheduleResponse,
} from "../scheduleTypes";

type FilterKey = "ALL" | "STUDY" | "EXAM";

type DaySection = {
  day: DayOfWeek;
  date: Date;
  schedules: ScheduleResponse[];
};

const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "Tất cả" },
  { key: "STUDY", label: "Lịch học" },
  { key: "EXAM", label: "Lịch thi" },
];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  next.setDate(next.getDate() + (day === 0 ? -6 : 1 - day));
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

const formatRange = (weekStart: Date) => {
  const weekEnd = addDays(weekStart, 6);
  return `${formatDate(weekStart).replace("/", "-")} - ${formatDate(weekEnd).replace("/", "-")}/${weekEnd.getFullYear()}`;
};

const dateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const matchesFilter = (schedule: ScheduleResponse, filter: FilterKey) => {
  if (filter === "ALL") return true;
  if (filter === "EXAM") return schedule.type === "EXAM";
  return schedule.type !== "EXAM";
};

const matchesSearch = (schedule: ScheduleResponse, query: string) => {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();

  return [
    schedule.className,
    schedule.courseName,
    schedule.teacherUserFullName,
    schedule.roomName,
    schedule.roomCode,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
};

const getScheduleDate = (schedule: ScheduleResponse, weekStart: Date) => {
  if (schedule.eventDate) {
    const date = new Date(`${schedule.eventDate}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  const normalizedDay = normalizeDayOfWeek(schedule.dayOfWeek);
  if (!normalizedDay) return null;

  const dayIndex = DAYS_ORDER.indexOf(normalizedDay);
  if (dayIndex === -1) return null;
  return addDays(weekStart, dayIndex);
};

const isInWeek = (date: Date, weekStart: Date) => {
  const weekEnd = addDays(weekStart, 6);
  return dateInputValue(date) >= dateInputValue(weekStart) && dateInputValue(date) <= dateInputValue(weekEnd);
};

const Icon = ({
  type,
  className = "h-4 w-4",
}: {
  type:
    | "calendar"
    | "print"
    | "search"
    | "chevronLeft"
    | "chevronRight"
    | "refresh";
  className?: string;
}) => {
  if (type === "calendar") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </svg>
    );
  }

  if (type === "print") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" rx="1" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={type === "chevronLeft" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
};

export const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<ScheduleResponse[]>("/student/schedules/me", {
        signal,
        allowAuthReplay: true,
      });
      setSchedules(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải thời khóa biểu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSchedules(controller.signal);
    return () => controller.abort();
  }, [fetchSchedules]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const visibleSchedules = useMemo(
    () =>
      schedules
        .filter((schedule) => matchesFilter(schedule, filter) && matchesSearch(schedule, search))
        .filter((schedule) => {
          const scheduleDate = getScheduleDate(schedule, weekStart);
          return scheduleDate ? isInWeek(scheduleDate, weekStart) : false;
        })
        .sort((a, b) => {
          const dateA = getScheduleDate(a, weekStart)?.getTime() ?? 0;
          const dateB = getScheduleDate(b, weekStart)?.getTime() ?? 0;
          if (dateA !== dateB) return dateA - dateB;
          return a.startTime.localeCompare(b.startTime);
        }),
    [filter, schedules, search, weekStart],
  );

  const daySections = useMemo<DaySection[]>(
    () =>
      weekDays
        .map((date, index) => ({
          day: DAYS_ORDER[index],
          date,
          schedules: visibleSchedules.filter((schedule) => {
            const scheduleDate = getScheduleDate(schedule, weekStart);
            return scheduleDate ? dateInputValue(scheduleDate) === dateInputValue(date) : false;
          }),
        }))
        .filter((section) => section.schedules.length > 0),
    [visibleSchedules, weekDays, weekStart],
  );

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-5 px-4 pb-6 pt-4">
      <section className="rounded-card border border-surface-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Lịch học
        </p>
        <h1 className="mt-2 text-[40px] font-semibold leading-none text-text-heading">
          Lịch học
        </h1>
        <p className="mt-3 max-w-[320px] text-sm leading-6 text-text-muted">
          Theo dõi lịch học và lịch thi theo tuần
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setWeekStart(startOfWeek(new Date()));
              fetchSchedules();
            }}
            disabled={isLoading}
            className="inline-flex min-h-12 items-center gap-2 rounded-btn border border-surface-border bg-white px-5 text-sm font-medium text-text-body shadow-sm disabled:opacity-50"
          >
            <Icon type="calendar" />
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-12 items-center gap-2 rounded-btn border border-primary bg-primary px-5 text-sm font-medium text-white shadow-sm"
          >
            <Icon type="print" />
            In lịch
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-card border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <section className="rounded-card border border-surface-border bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <div className="inline-flex w-fit rounded-btn bg-surface-page p-1">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`min-h-11 rounded-[10px] px-5 text-sm font-medium transition-all ${
                  filter === item.key ? "bg-white text-primary shadow-sm" : "text-text-body"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-btn border border-surface-border bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="flex h-11 w-12 items-center justify-center text-text-muted"
              aria-label="Tuần trước"
            >
              <Icon type="chevronLeft" />
            </button>
            <div className="flex h-11 min-w-0 flex-1 items-center justify-center border-x border-surface-border px-4 text-sm font-semibold text-text-heading">
              {formatRange(weekStart)}
            </div>
            <button
              type="button"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="flex h-11 w-12 items-center justify-center text-text-muted"
              aria-label="Tuần sau"
            >
              <Icon type="chevronRight" />
            </button>
          </div>

          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Icon type="search" />
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm môn học, giảng viên, phòng..."
              className="h-11 w-full rounded-btn border border-surface-border bg-white pl-11 pr-4 text-sm text-text-heading outline-none placeholder:text-text-muted focus:border-primary"
            />
          </label>

          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-text-muted">
              {WEEKDAYS_MAP[DAYS_ORDER[0]].short} - {WEEKDAYS_MAP[DAYS_ORDER[6]].short}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">
                {visibleSchedules.length} ca
              </span>
              <button
                type="button"
                onClick={() => fetchSchedules()}
                disabled={isLoading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-text-muted disabled:opacity-50"
                aria-label="Làm mới lịch học"
              >
                <Icon type="refresh" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ScheduleCardList
        sections={daySections}
        isLoading={isLoading}
        emptyMessage="Không có lịch học hoặc lịch thi trong tuần đang xem."
      />
    </div>
  );
};

export default SchedulePage;
