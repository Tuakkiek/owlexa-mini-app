export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceResponse {
  id: number;
  scheduleId?: number | null;
  scheduleEventId?: number | null;
  classId: number;
  centerId: number;
  studentUserId: number;
  studentPhoneNumber: string;
  studentFullName: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  markedByUserId: number | null;
  createdAt: string;
}

export const ATTENDANCE_STATUS_META: Record<
  AttendanceStatus,
  { label: string; toneClass: string; cardClass: string }
> = {
  PRESENT: {
    label: "Có mặt",
    toneClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cardClass: "bg-emerald-50 text-emerald-800",
  },
  ABSENT: {
    label: "Vắng",
    toneClass: "border-rose-200 bg-rose-50 text-rose-700",
    cardClass: "bg-rose-50 text-rose-800",
  },
  LATE: {
    label: "Muộn",
    toneClass: "border-amber-200 bg-amber-50 text-amber-700",
    cardClass: "bg-amber-50 text-amber-800",
  },
  EXCUSED: {
    label: "Xin phép",
    toneClass: "border-blue-200 bg-blue-50 text-blue-700",
    cardClass: "bg-blue-50 text-blue-800",
  },
};

export interface StudentClassSessionResponse {
  scheduleEventId: number;
  classId: number;
  className: string;
  roomName?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  attendanceStatus: AttendanceStatus | null;
  note?: string;
}
