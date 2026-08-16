import React, { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import {
  ATTENDANCE_STATUS_META,
  type StudentClassSessionResponse,
} from "../attendanceTypes";

const formatDateLabel = (value: string) => {
  if (!value) return "Chưa chọn";
  try {
    const formatted = new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return value;
  }
};

export const AttendancePage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessions, setSessions] = useState<StudentClassSessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<StudentClassSessionResponse[]>(
        "/student/attendance/class-sessions",
        {
          signal,
          allowAuthReplay: true,
          params: { date },
        },
      );
      setSessions(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải dữ liệu điểm danh.");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSessions(controller.signal);
    return () => controller.abort();
  }, [fetchSessions]);

  const handlePrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
            Điểm danh
          </h1>
        </div>
      </header>

      {error && (
        <div className="rounded-[16px] border border-error/20 bg-red-50 p-4 text-xs text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchSessions()}
            className="mt-2 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Date Filter Box */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm flex flex-col gap-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-text-heading">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Ngày đang xem</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevDay}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading transition-colors hover:bg-surface-hover"
          >
            &lt;
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 flex-1 min-w-0 rounded-[12px] border border-surface-border bg-white px-3 text-sm text-text-heading outline-none transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={handleNextDay}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading transition-colors hover:bg-surface-hover"
          >
            &gt;
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDate(new Date().toISOString().split("T")[0])}
          className="h-11 w-full rounded-[12px] border border-surface-border bg-white text-sm font-semibold text-text-heading transition-colors hover:bg-surface-hover"
        >
          Hôm nay
        </button>
      </section>

      {/* Summary Info */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>{formatDateLabel(date)}</span>
        <span className="font-medium">{sessions.length} ca học</span>
      </div>

      {/* Session Records List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-[140px] animate-pulse rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
            <CalendarDays className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-heading">
            Không có ca học nào
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Bạn không có lịch học nào trong ngày {formatDateLabel(date)}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const meta = session.attendanceStatus 
              ? ATTENDANCE_STATUS_META[session.attendanceStatus]
              : null;

            return (
              <article
                key={session.scheduleEventId}
                className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-heading">
                      {session.className}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  {meta ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase whitespace-nowrap ${meta.toneClass}`}
                    >
                      {meta.label}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-600 whitespace-nowrap">
                      Chưa điểm danh
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 opacity-70" />
                    <span className="truncate">{session.teacherName || "Chưa xếp"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 opacity-70" />
                    <span className="truncate">{session.roomName || "Chưa xếp"}</span>
                  </div>
                </div>

                {session.note && (
                  <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-surface-page p-3 text-xs text-text-body">
                    <MessageSquare className="h-4 w-4 shrink-0 text-text-muted mt-0.5" />
                    <span>{session.note}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
