import type { AssessmentType } from "@/features/assignments/assignmentTypes";

export type QuestionType = "MULTIPLE_CHOICE" | "ESSAY";

export type SubmissionAttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED";

export type AIGradingJobStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface StartAttemptRequest {
  password?: string;
}

export interface SubmissionAnswerRequest {
  assignmentItemId: number;
  answerText?: string | null;
  selectedOptionIds?: number[] | null;
}

export interface SaveSubmissionAnswersRequest {
  answers: SubmissionAnswerRequest[];
}

export interface SubmissionAttemptItemOptionResponse {
  assignmentItemOptionId: number;
  content: unknown;
  displayOrder: number;
}

export interface StudentAttemptItemResponse {
  assignmentItemId: number;
  questionId?: number | null;
  questionType: QuestionType;
  title: string | null;
  content: unknown;
  points: number | null;
  displayOrder: number;
  options: SubmissionAttemptItemOptionResponse[];
}

export interface SubmissionAnswerResponse {
  assignmentItemId: number;
  answerText: string | null;
  selectedOptionIds: number[];
  autoScore: number | null;
  maxScore: number | null;
  gradedAt: string | null;
}

export interface StudentAttemptSummaryResponse {
  id: number;
  attemptNumber: number;
  status: SubmissionAttemptStatus;
  startedAt: string;
  expiresAt: string | null;
  lastSavedAt: string | null;
  submittedAt: string | null;
  autoScore: number | null;
  displayedScore?: number | null;
  maxScore: number | null;
  aiGradingStatus?: AIGradingJobStatus | null;
  aiGradingMessage?: string | null;
}

export interface StudentAttemptDetailResponse {
  id: number;
  assignmentId: number;
  assignmentRecipientId: number;
  assignmentTitleSnapshot: string;
  assignmentTypeSnapshot: AssessmentType;
  assignmentContent: unknown;
  status: SubmissionAttemptStatus;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string | null;
  lastSavedAt: string | null;
  submittedAt: string | null;
  autoScore: number | null;
  maxScore: number | null;
  audioPositionSeconds?: number;
  audioCompleted?: boolean;
  audioFile?: unknown | null;
  playbackMode?: string | null;
  items: StudentAttemptItemResponse[];
  answers: SubmissionAnswerResponse[];
  showScore?: boolean;
  allowReview?: boolean;
  hasPassword?: boolean;
  aiGradingStatus?: AIGradingJobStatus | null;
  aiGradingMessage?: string | null;
}

export const SUBMISSION_STATUS_META: Record<
  SubmissionAttemptStatus,
  { label: string; badgeClass: string }
> = {
  IN_PROGRESS: {
    label: "Đang làm bài",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
  },
  SUBMITTED: {
    label: "Đã nộp",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  AUTO_SUBMITTED: {
    label: "Tự động nộp",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
};
