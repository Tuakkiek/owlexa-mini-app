import React, { useCallback, useEffect, useMemo, useState } from "react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";
import {
  ATTENDANCE_STATUS_META,
  type AttendanceResponse,
  type AttendanceStatus,
} from "../attendanceTypes";

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

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
      base[record.status] += 1;
    });

    return base;
  }, [attendanceRecords]);

  const selectedClass = classOptions.find((option) => option.classId === selectedClassId) || null;
  const isLoading = isLoadingSchedules || isLoadingAttendance;

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-6 px-4 pb-6 pt-4">
      <section className="rounded-card border border-surface-border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Điểm danh
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-text-heading">
              Lịch sử có mặt
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Theo dõi trạng thái học tập của bạn theo từng lớp và từng ngày.
            </p>
          </div>
          <button
            onClick={() => fetchAttendance()}
            disabled={isLoading || !selectedClassId}
            className="min-h-12 rounded-btn border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Lớp hiện chọn
            </p>
            <p className="mt-2 truncate text-sm font-bold text-text-heading">
              {selectedClass?.className || "Chưa có lớp"}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Ngày đang xem
            </p>
            <p className="mt-2 text-sm font-bold text-text-heading">
              {formatDateLabel(date)}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <section className="rounded-card border border-surface-border bg-white p-4">
        <div className="grid gap-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Lớp học
            </label>
            <select
              value={selectedClassId ?? ""}
              onChange={(e) =>
                setSelectedClassId(e.target.value ? Number(e.target.value) : null)
              }
              className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Ngày
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {(["PRESENT", "LATE", "EXCUSED", "ABSENT"] as AttendanceStatus[]).map((status) => (
          <div
            key={status}
            className={`rounded-[22px] px-4 py-4 ${ATTENDANCE_STATUS_META[status].cardClass}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              {ATTENDANCE_STATUS_META[status].label}
            </p>
            <p className="mt-2 text-2xl font-bold">{stats[status]}</p>
          </div>
        ))}
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
            />
          ))}
        </div>
      ) : classOptions.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-text-heading">Bạn chưa được xếp vào lớp nào</p>
          <p className="mt-1 text-xs text-text-muted">
            Khi có lịch học, dữ liệu điểm danh sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : attendanceRecords.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-text-heading">
            Chưa có dữ liệu điểm danh
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {selectedClass
              ? `Hiện chưa có bản ghi cho ${selectedClass.className} vào ngày đã chọn.`
              : "Hãy chọn lớp để xem điểm danh."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceRecords
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record) => (
              <article
                key={record.id}
                className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                      Ngày điểm danh
                    </p>
                    <h3 className="mt-1 text-base font-bold text-text-heading">
                      {formatDateLabel(record.date)}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${ATTENDANCE_STATUS_META[record.status].toneClass}`}
                  >
                    {ATTENDANCE_STATUS_META[record.status].label}
                  </span>
                </div>

                <div className="mt-4 rounded-[18px] bg-surface-page px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                    Ghi chú
                  </p>
                  <p className="mt-1 text-sm text-text-body">
                    {record.note?.trim() || "Không có ghi chú thêm."}
                  </p>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
