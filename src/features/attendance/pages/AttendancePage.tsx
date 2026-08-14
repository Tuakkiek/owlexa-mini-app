import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleCheck,
  BookOpen,
  Calendar,
  RotateCw,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";
import {
  ATTENDANCE_STATUS_META,
  type AttendanceResponse,
  type AttendanceStatus,
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

const STATUS_BADGE_STYLES: Record<
  AttendanceStatus,
  { label: string; badgeClass: string }
> = {
  PRESENT: {
    label: "Có mặt",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  LATE: {
    label: "Muộn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  EXCUSED: {
    label: "Xin phép",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ABSENT: {
    label: "Vắng mặt",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export const AttendancePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceResponse[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoadingSchedules(true);
      setError(null);
      const res = await httpClient.get<ScheduleResponse[]>("/student/schedules/me", {
        signal,
        allowAuthReplay: true,
      });
      setSchedules(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải danh sách lớp học.");
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSchedules(controller.signal);
    return () => controller.abort();
  }, [fetchSchedules]);

  const classOptions = useMemo(() => {
    const map = new Map<number, { classId: number; className: string; courseName?: string }>();
    schedules.forEach((schedule) => {
      if (!map.has(schedule.classId)) {
        map.set(schedule.classId, {
          classId: schedule.classId,
          className: schedule.className,
          courseName: schedule.courseName,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.className.localeCompare(b.className));
  }, [schedules]);

  useEffect(() => {
    if (classOptions.length > 0 && selectedClassId === null) {
      setSelectedClassId(classOptions[0].classId);
    }
  }, [classOptions, selectedClassId]);

  const fetchAttendance = useCallback(
    async (signal?: AbortSignal) => {
      if (!selectedClassId) {
        setAttendanceRecords([]);
        return;
      }

      try {
        setIsLoadingAttendance(true);
        setError(null);
        const res = await httpClient.get<AttendanceResponse[]>("/student/attendance", {
          signal,
          allowAuthReplay: true,
          params: { classId: selectedClassId, date },
        });
        setAttendanceRecords(res.data);
      } catch (err: any) {
        if (err?.kind === "REQUEST_ABORTED") return;
        const apiErr = err as AppApiError;
        setError(apiErr.message || "Không thể tải dữ liệu điểm danh.");
        setAttendanceRecords([]);
      } finally {
        setIsLoadingAttendance(false);
      }
    },
    [date, selectedClassId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAttendance(controller.signal);
    return () => controller.abort();
  }, [fetchAttendance]);

  const stats = useMemo(() => {
    const base: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };

    attendanceRecords.forEach((record) => {
      if (base[record.status] !== undefined) {
        base[record.status] += 1;
      }
    });

    return base;
  }, [attendanceRecords]);

  const selectedClass = classOptions.find((option) => option.classId === selectedClassId) || null;
  const isLoading = isLoadingSchedules || isLoadingAttendance;

  return (
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            ĐIỂM DANH
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
            Lịch sử có mặt
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Theo dõi trạng thái học tập theo từng lớp và ngày
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAttendance()}
          disabled={isLoading || !selectedClassId}
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
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Lớp hiện chọn</p>
            <p className="mt-1 truncate text-sm font-bold text-text-heading">
              {selectedClass?.className || "Chưa chọn lớp"}
            </p>
          </div>
          <p className="mt-2 text-xs text-text-muted truncate">
            {classOptions.length} lớp học khả dụng
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Ngày đang xem</p>
            <p className="mt-1 truncate text-xs font-bold text-text-heading">
              {formatDateLabel(date)}
            </p>
          </div>
          <p className="mt-2 text-xs text-primary font-medium truncate">
            {attendanceRecords.length} bản ghi
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[16px] border border-error/20 bg-red-50 p-4 text-xs text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchAttendance()}
            className="mt-2 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Class & Date Filter Box */}
      <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm space-y-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-heading">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Chọn lớp học</span>
          </label>
          <select
            value={selectedClassId ?? ""}
            onChange={(e) =>
              setSelectedClassId(e.target.value ? Number(e.target.value) : null)
            }
            className="h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-sm text-text-heading outline-none transition-colors focus:border-primary"
          >
            {classOptions.length === 0 ? (
              <option value="">Chưa có lớp học</option>
            ) : (
              classOptions.map((option) => (
                <option key={option.classId} value={option.classId}>
                  {option.className}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-heading">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Chọn ngày</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-surface-border bg-white px-3 text-sm text-text-heading outline-none transition-colors focus:border-primary"
          />
        </div>
      </section>

      {/* 4 Status Counters (2x2) */}
      <section className="grid grid-cols-2 gap-3">
        {(["PRESENT", "LATE", "EXCUSED", "ABSENT"] as AttendanceStatus[]).map((status) => {
          const meta = STATUS_BADGE_STYLES[status];
          return (
            <div
              key={status}
              className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
            >
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
                <p className="mt-2 text-2xl font-bold text-text-heading">
                  {stats[status]}
                </p>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                Trạng thái ngày chọn
              </p>
            </div>
          );
        })}
      </section>

      {/* Attendance Records List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-[100px] animate-pulse rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
            />
          ))}
        </div>
      ) : classOptions.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-heading">
            Bạn chưa được xếp vào lớp nào
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Khi có lịch học, dữ liệu điểm danh sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : attendanceRecords.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-page text-text-muted">
            <CircleCheck className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-semibold text-text-heading">
            Chưa có dữ liệu điểm danh
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {selectedClass
              ? `Hiện chưa có bản ghi điểm danh cho ${selectedClass.className} vào ngày đã chọn.`
              : "Hãy chọn lớp để xem điểm danh."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceRecords
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record) => {
              const meta = STATUS_BADGE_STYLES[record.status] || ATTENDANCE_STATUS_META[record.status];

              return (
                <article
                  key={record.id}
                  className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary-light text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-text-muted">
                          Ngày điểm danh
                        </p>
                        <h3 className="text-sm font-bold text-text-heading">
                          {formatDateLabel(record.date)}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-surface-page p-3 text-xs text-text-body">
                    <MessageSquare className="h-4 w-4 shrink-0 text-text-muted mt-0.5" />
                    <span>
                      {record.note?.trim() || "Không có ghi chú thêm."}
                    </span>
                  </div>
                </article>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
