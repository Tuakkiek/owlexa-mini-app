import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Calendar, RotateCw } from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { WeekdaySelector } from "../components/WeekdaySelector";
import { ScheduleCardList } from "../components/ScheduleCardList";
import { WEEKDAYS_MAP, getWeekdayInfo, type DayOfWeek, type ScheduleResponse } from "../scheduleTypes";

const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const getTodayKey = (): DayOfWeek => {
  const day = new Date().getDay();
  return DAYS_ORDER[(day + 6) % 7];
};

export const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayKey());
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

  const selectedDayInfo = getWeekdayInfo(selectedDay);
  const filteredSchedules = schedules.filter(
    (item) => getWeekdayInfo(item.dayOfWeek).dayNumber === selectedDayInfo.dayNumber,
  );
  const totalSessions = schedules.length;

  return (
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            LỊCH HỌC
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
            Thời khóa biểu
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Theo dõi ca học theo từng ngày trong tuần
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchSchedules()}
          disabled={isLoading}
          aria-label="Làm mới"
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading shadow-sm transition-colors hover:bg-surface-hover active:bg-gray-100 disabled:opacity-50"
        >
          <RotateCw className={`h-5 w-5 text-gray-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Summary Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Tổng ca / tuần</p>
            <p className="mt-1 text-2xl font-bold text-text-heading">
              {isLoading ? "..." : totalSessions}
            </p>
          </div>
          <p className="mt-2 text-xs text-text-muted truncate">
            Đồng bộ từ trung tâm
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Đang xem</p>
            <p className="mt-1 truncate text-lg font-bold text-text-heading">
              {WEEKDAYS_MAP[selectedDay].label}
            </p>
          </div>
          <p className="mt-2 text-xs text-primary font-medium truncate">
            {filteredSchedules.length} ca học trong ngày
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[16px] border border-error/20 bg-red-50 p-4 text-xs text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchSchedules()}
            className="mt-2 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Weekday Selector Section */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-muted">
            Chọn ngày học
          </span>
          <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {filteredSchedules.length} ca
          </span>
        </div>
        <WeekdaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      </section>

      {/* Schedules List */}
      <ScheduleCardList schedules={filteredSchedules} isLoading={isLoading} />
    </div>
  );
};

export default SchedulePage;
