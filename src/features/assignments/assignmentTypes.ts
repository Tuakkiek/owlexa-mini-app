export type AssessmentType = "QUIZ" | "HOMEWORK" | "EXAM";

export type AssignmentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "CLOSED"
  | "ARCHIVED";

export type AssignmentRecipientStatus = "ASSIGNED";

export interface StudentAssignmentListResponse {
  id: number;
  recipientId: number;
  type: AssessmentType;
  status: AssignmentStatus;
  recipientStatus: AssignmentRecipientStatus;
  title: string;
  description: string | null;
  openAt: string | null;
  dueAt: string | null;
  timeLimitMinutes: number | null;
  attemptLimit: number | null;
  showScore: boolean;
  allowReview: boolean;
  hasPassword: boolean;
  assignedAt: string;
}

export const ASSIGNMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  QUIZ: "Trắc nghiệm",
  HOMEWORK: "Bài tập về nhà",
  EXAM: "Bài kiểm tra",
};

export const ASSIGNMENT_STATUS_META: Record<
  AssignmentStatus,
  { label: string; badgeClass: string }
> = {
  DRAFT: {
    label: "Nháp",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
  },
  SCHEDULED: {
    label: "Đã lên lịch",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
  },
  ACTIVE: {
    label: "Đang diễn ra",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    badgeClass: "border-zinc-200 bg-zinc-50 text-zinc-700",
  },
};
