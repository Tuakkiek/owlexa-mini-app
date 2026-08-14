import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "zmp-ui";
import { Lock, RotateCw, History, Play, CircleCheck } from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { PATHS } from "@/router/routes";
import {
  ASSIGNMENT_STATUS_META,
  ASSIGNMENT_TYPE_LABEL,
  type StudentAssignmentListResponse,
} from "../assignmentTypes";
import {
  SUBMISSION_STATUS_META,
  type AIGradingJobStatus,
  type StartAttemptRequest,
  type StudentAttemptDetailResponse,
  type StudentAttemptSummaryResponse,
} from "@/features/submission/submissionTypes";

const formatDateTime = (value: string | null) => {
  if (!value) return "Chưa đặt";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatRemaining = (value: string | null) => {
  if (!value) return "Không giới hạn";

  const due = new Date(value).getTime();
  const now = Date.now();
  const deltaMs = due - now;

  if (deltaMs <= 0) return "Đã hết hạn";

  const totalHours = Math.floor(deltaMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  if (hours > 0) return `Còn ${hours} giờ`;
  return "Sắp đến hạn";
};

const buildAttemptPath = (attemptId: number) => `/assignments/attempt/${attemptId}`;

const aiGradingScoreLabel: Partial<Record<AIGradingJobStatus, string>> = {
  PENDING: "Đang chấm",
  RUNNING: "Đang chấm",
  FAILED: "Chưa chấm được",
};

const formatAttemptScore = (
  attempt: StudentAttemptSummaryResponse,
  showScore: boolean,
) => {
  if (!showScore) return "Không hiển thị";
  if (attempt.status === "IN_PROGRESS") return "-";
  if (attempt.displayedScore == null) {
    return attempt.aiGradingStatus
      ? (aiGradingScoreLabel[attempt.aiGradingStatus] ?? "-")
      : "-";
  }
  return `${attempt.displayedScore} / ${attempt.maxScore ?? "-"}`;
};

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentAssignmentListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStartId, setPendingStartId] = useState<number | null>(null);
  const [pendingHistoryId, setPendingHistoryId] = useState<number | null>(null);
  const [passwordAssignment, setPasswordAssignment] =
    useState<StudentAssignmentListResponse | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [historyAssignment, setHistoryAssignment] =
    useState<StudentAssignmentListResponse | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<StudentAttemptSummaryResponse[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchAssignments = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<StudentAssignmentListResponse[]>(
        "/student/assignments",
        {
          signal,
          allowAuthReplay: true,
        },
      );
      setAssignments(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải danh sách bài tập.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAssignments(controller.signal);
    return () => controller.abort();
  }, [fetchAssignments]);

  const stats = useMemo(() => {
    const activeCount = assignments.filter((item) => item.status === "ACTIVE").length;
    const passwordCount = assignments.filter((item) => item.hasPassword).length;
    const reviewEnabledCount = assignments.filter((item) => item.allowReview).length;

    return { activeCount, passwordCount, reviewEnabledCount };
  }, [assignments]);

  const startOrResumeAttempt = async (
    assignment: StudentAssignmentListResponse,
    body?: StartAttemptRequest,
  ) => {
    try {
      setPendingStartId(assignment.id);
      setError(null);
      const res = await httpClient.post<StudentAttemptDetailResponse>(
        `/student/assignments/${assignment.id}/attempts/start`,
        body ?? null,
        {
          allowAuthReplay: true,
        },
      );
      setPasswordAssignment(null);
      setPasswordValue("");
      setPasswordError(null);
      navigate(buildAttemptPath(res.data.id));
    } catch (err: any) {
      const apiErr = err as AppApiError;
      if (passwordAssignment) {
        setPasswordError(apiErr.message || "Không thể bắt đầu bài làm.");
      } else {
        setError(apiErr.message || "Không thể bắt đầu bài làm.");
      }
    } finally {
      setPendingStartId(null);
    }
  };

  const handleStartClick = (assignment: StudentAssignmentListResponse) => {
    if (assignment.hasPassword) {
      setPasswordAssignment(assignment);
      setPasswordValue("");
      setPasswordError(null);
      return;
    }
    startOrResumeAttempt(assignment);
  };

  const openAttemptHistory = async (assignment: StudentAssignmentListResponse) => {
    try {
      setPendingHistoryId(assignment.id);
      setHistoryAssignment(assignment);
      setHistoryError(null);
      setIsHistoryLoading(true);
      const res = await httpClient.get<StudentAttemptSummaryResponse[]>(
        `/student/assignments/${assignment.id}/attempts`,
        {
          allowAuthReplay: true,
        },
      );
      setAttemptHistory(res.data);
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setHistoryError(apiErr.message || "Không thể tải lịch sử làm bài.");
      setAttemptHistory([]);
    } finally {
      setPendingHistoryId(null);
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-6 px-4 pb-6 pt-4">
      <section className="rounded-card border border-surface-border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Bài tập
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-text-heading">
              Danh sách bài được giao
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Theo dõi bài tập về nhà, trắc nghiệm và bài kiểm tra dành cho bạn.
            </p>
          </div>
          <button
            onClick={() => fetchAssignments()}
            disabled={isLoading}
            aria-label="Làm mới"
            className="flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Đang mở
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : stats.activeCount}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Có mật khẩu
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : stats.passwordCount}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Cho xem lại
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : stats.reviewEnabledCount}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-36 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-text-heading">
            Chưa có bài tập nào được giao
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Khi giáo viên giao bài, danh sách sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const statusMeta = ASSIGNMENT_STATUS_META[assignment.status];

            return (
              <article
                key={assignment.recipientId}
                className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                        {ASSIGNMENT_TYPE_LABEL[assignment.type]}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                      {assignment.hasPassword && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                          <Lock className="h-3 w-3" />
                          <span>Có mật khẩu</span>
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-text-heading">
                      {assignment.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {assignment.description?.trim() || "Chưa có mô tả cho bài tập này."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-surface-page px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      Mở từ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-heading">
                      {formatDateTime(assignment.openAt)}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-surface-page px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      Hạn nộp
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-heading">
                      {formatDateTime(assignment.dueAt)}
                    </p>
                    <p className="mt-1 text-xs text-primary">
                      {formatRemaining(assignment.dueAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                    Lượt làm: {assignment.attemptLimit ?? "Không giới hạn"}
                  </span>
                  <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                    Giới hạn thời gian: {assignment.timeLimitMinutes ? `${assignment.timeLimitMinutes} phút` : "Không giới hạn"}
                  </span>
                  <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                    Xem lại bài: {assignment.allowReview ? "Có" : "Không"}
                  </span>
                  <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                    Hiển thị điểm: {assignment.showScore ? "Có" : "Không"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartClick(assignment)}
                    disabled={pendingStartId === assignment.id}
                    className="flex items-center justify-center gap-1.5 rounded-[16px] bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>{pendingStartId === assignment.id ? "Đang mở..." : "Bắt đầu / Tiếp tục"}</span>
                  </button>
                  <button
                    onClick={() => openAttemptHistory(assignment)}
                    disabled={pendingHistoryId === assignment.id}
                    className="flex items-center justify-center gap-1.5 rounded-[16px] border border-surface-border bg-white py-3 text-sm font-semibold text-text-body disabled:opacity-50"
                  >
                    <History className="h-4 w-4" />
                    <span>{pendingHistoryId === assignment.id ? "Đang tải..." : "Lịch sử làm bài"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {passwordAssignment && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-card bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-text-heading">Nhập mật khẩu bài làm</h3>
            <p className="mt-2 text-sm text-text-muted">
              Bài <span className="font-semibold text-text-heading">{passwordAssignment.title}</span> yêu cầu mật khẩu để bắt đầu.
            </p>
            <input
              type="password"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Nhập mật khẩu"
              className="mt-4 h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
            />
            {passwordError && (
              <p className="mt-2 text-sm text-error">{passwordError}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setPasswordAssignment(null);
                  setPasswordValue("");
                  setPasswordError(null);
                }}
                className="flex-1 rounded-[16px] border border-surface-border bg-white py-3 text-sm font-semibold text-text-body"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!passwordValue.trim()) {
                    setPasswordError("Vui lòng nhập mật khẩu.");
                    return;
                  }
                  startOrResumeAttempt(passwordAssignment, {
                    password: passwordValue.trim(),
                  });
                }}
                disabled={pendingStartId === passwordAssignment.id}
                className="flex-1 rounded-[16px] bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pendingStartId === passwordAssignment.id ? "Đang mở..." : "Bắt đầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyAssignment && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-card bg-white p-6 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-text-heading">Lịch sử làm bài</h3>
                <p className="mt-1 text-sm text-text-muted">{historyAssignment.title}</p>
              </div>
              <button
                onClick={() => {
                  setHistoryAssignment(null);
                  setAttemptHistory([]);
                  setHistoryError(null);
                }}
                className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-body"
              >
                Đóng
              </button>
            </div>

            {historyError && (
              <div className="mt-4 rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
                {historyError}
              </div>
            )}

            {isHistoryLoading ? (
              <div className="mt-4 space-y-3">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="h-24 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
                  />
                ))}
              </div>
            ) : attemptHistory.length === 0 ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-10 text-center">
                <p className="text-sm font-semibold text-text-heading">Chưa có lượt làm bài nào</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {attemptHistory.map((attempt) => (
                  <article
                    key={attempt.id}
                    className="rounded-[24px] border border-surface-border bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                          Lượt {attempt.attemptNumber}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-text-heading">
                          Bắt đầu {formatDateTime(attempt.startedAt)}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Nộp lúc: {formatDateTime(attempt.submittedAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          SUBMISSION_STATUS_META[attempt.status].badgeClass
                        }`}
                      >
                        {SUBMISSION_STATUS_META[attempt.status].label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                        Hết hạn: {formatDateTime(attempt.expiresAt)}
                      </span>
                      <span className="rounded-full bg-surface-page px-3 py-1.5 text-text-body">
                        Điểm: {formatAttemptScore(attempt, historyAssignment.showScore)}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(buildAttemptPath(attempt.id))}
                      className="mt-4 w-full rounded-[16px] border border-surface-border bg-white py-3 text-sm font-semibold text-text-body"
                    >
                      {attempt.status === "IN_PROGRESS" ? "Tiếp tục lượt này" : "Xem lượt làm"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
