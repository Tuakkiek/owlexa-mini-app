import React, { useCallback, useEffect, useState } from "react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { WeekdaySelector } from "../components/WeekdaySelector";
import { ScheduleCardList } from "../components/ScheduleCardList";
import { WEEKDAYS_MAP, type DayOfWeek, type ScheduleResponse } from "../scheduleTypes";

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

  const filteredSchedules = schedules.filter((item) => item.dayOfWeek === selectedDay);
  const totalSessions = schedules.length;

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <section className="rounded-[24px] bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#ffedd5_100%)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Lịch học
            </p>
            <h1 className="mt-1 text-[24px] font-bold leading-tight text-text-heading">
              Thời khóa biểu tuần
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Theo dõi ca học theo từng ngày và kiểm tra giáo viên, phòng học.
            </p>
          </div>
          <button
            onClick={() => fetchSchedules()}
            disabled={isLoading}
            className="rounded-full border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Tổng ca / tuần
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : totalSessions}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Đang xem
            </p>
            <p className="mt-2 text-sm font-bold text-text-heading">
              {WEEKDAYS_MAP[selectedDay].label}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">
            Chọn ngày học
          </span>
          <span className="text-xs font-semibold text-primary">
            {filteredSchedules.length} ca
          </span>
        </div>
        <div className="mt-3">
          <WeekdaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>
      </section>

      <ScheduleCardList schedules={filteredSchedules} isLoading={isLoading} />
    </div>
  );
};

export default SchedulePage;
