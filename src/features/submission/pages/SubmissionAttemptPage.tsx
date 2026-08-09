import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "zmp-ui";
import RichContentRenderer from "@/components/content/RichContentRenderer";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { PATHS } from "@/router/routes";
import {
  SUBMISSION_STATUS_META,
  type SaveSubmissionAnswersRequest,
  type StudentAttemptDetailResponse,
} from "../submissionTypes";

const formatDateTime = (value: string | null) => {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const SubmissionAttemptPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ attemptId: string }>();
  const attemptId = Number(params.attemptId);

  const [attempt, setAttempt] = useState<StudentAttemptDetailResponse | null>(null);
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [choiceAnswers, setChoiceAnswers] = useState<Record<number, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const syncAnswerState = useCallback((detail: StudentAttemptDetailResponse) => {
    const nextEssay: Record<number, string> = {};
    const nextChoice: Record<number, number | null> = {};

    detail.items.forEach((item) => {
      const existing = detail.answers.find(
        (answer) => answer.assignmentItemId === item.assignmentItemId,
      );

      if (item.questionType === "ESSAY") {
        nextEssay[item.assignmentItemId] = existing?.answerText || "";
      } else {
        nextChoice[item.assignmentItemId] = existing?.selectedOptionIds?.[0] ?? null;
      }
    });

    setEssayAnswers(nextEssay);
    setChoiceAnswers(nextChoice);
  }, []);

  const fetchAttempt = useCallback(
    async (signal?: AbortSignal) => {
      if (!attemptId) {
        setError("Không tìm thấy mã lượt làm bài.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await httpClient.get<StudentAttemptDetailResponse>(
          `/student/submission-attempts/${attemptId}`,
          {
            signal,
            allowAuthReplay: true,
          },
        );
        setAttempt(res.data);
        syncAnswerState(res.data);
      } catch (err: any) {
        if (err?.kind === "REQUEST_ABORTED") return;
        const apiErr = err as AppApiError;
        setError(apiErr.message || "Không thể tải dữ liệu bài làm.");
      } finally {
        setIsLoading(false);
      }
    },
    [attemptId, syncAnswerState],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAttempt(controller.signal);
    return () => controller.abort();
  }, [fetchAttempt]);

  const isReadOnly =
    attempt?.status === "SUBMITTED" || attempt?.status === "AUTO_SUBMITTED";

  const answerPayload = useMemo<SaveSubmissionAnswersRequest | null>(() => {
    if (!attempt) return null;

    return {
      answers: attempt.items.map((item) => {
        if (item.questionType === "ESSAY") {
          return {
            assignmentItemId: item.assignmentItemId,
            answerText: essayAnswers[item.assignmentItemId] ?? "",
            selectedOptionIds: [],
          };
        }

        const selectedId = choiceAnswers[item.assignmentItemId];
        return {
          assignmentItemId: item.assignmentItemId,
          answerText: null,
          selectedOptionIds: selectedId ? [selectedId] : [],
        };
      }),
    };
  }, [attempt, choiceAnswers, essayAnswers]);

  const saveAnswers = async () => {
    if (!attempt || !answerPayload || isReadOnly) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      const res = await httpClient.put<StudentAttemptDetailResponse>(
        `/student/submission-attempts/${attempt.id}/answers`,
        answerPayload,
        {
          allowAuthReplay: true,
        },
      );
      setAttempt(res.data);
      syncAnswerState(res.data);
      setSuccessMessage("Đã lưu câu trả lời.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể lưu câu trả lời.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitAttempt = async () => {
    if (!attempt || isReadOnly) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      if (answerPayload) {
        await httpClient.put<StudentAttemptDetailResponse>(
          `/student/submission-attempts/${attempt.id}/answers`,
          answerPayload,
          {
            allowAuthReplay: true,
          },
        );
      }

      const res = await httpClient.post<StudentAttemptDetailResponse>(
        `/student/submission-attempts/${attempt.id}/submit`,
        null,
        {
          allowAuthReplay: true,
        },
      );
      setAttempt(res.data);
      syncAnswerState(res.data);
      setSuccessMessage("Đã nộp bài thành công.");
    } catch (err: any) {
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể nộp bài.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-6 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(PATHS.ASSIGNMENTS)}
          className="rounded-full border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body"
        >
          Quay lại
        </button>
        {!isReadOnly && (
          <button
            onClick={saveAnswers}
            disabled={isSaving || isLoading || !attempt}
            className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu bài làm"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-36 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
            />
          ))}
        </div>
      ) : !attempt ? (
        <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-text-heading">
            Không thể mở lượt làm bài
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-card border border-surface-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Lượt làm bài
                </p>
                <h1 className="mt-1 text-3xl font-semibold leading-tight text-text-heading">
                  {attempt.assignmentTitleSnapshot}
                </h1>
                <p className="mt-2 text-sm text-text-muted">
                  Lượt {attempt.attemptNumber} · Bắt đầu {formatDateTime(attempt.startedAt)}
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

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  Hạn nộp lượt này
                </p>
                <p className="mt-1 text-sm font-semibold text-text-heading">
                  {formatDateTime(attempt.expiresAt)}
                </p>
              </div>
              <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  Điểm tự động
                </p>
                <p className="mt-1 text-sm font-semibold text-text-heading">
                  {attempt.showScore
                    ? `${attempt.autoScore ?? "-"} / ${attempt.maxScore ?? "-"}`
                    : "Chưa hiển thị"}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {attempt.items
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((item, index) => {
                const savedAnswer = attempt.answers.find(
                  (answer) => answer.assignmentItemId === item.assignmentItemId,
                );

                return (
                  <article
                    key={item.assignmentItemId}
                    className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                          Câu {index + 1}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-text-heading">
                          {item.title?.trim() || "Nội dung câu hỏi"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-surface-page px-3 py-1 text-xs font-semibold text-text-body">
                        {item.points ?? "-"} điểm
                      </span>
                    </div>

                    <div className="mt-3 rounded-[18px] bg-surface-page px-4 py-3">
                      <RichContentRenderer
                        content={item.content}
                        emptyText="Không có nội dung hiển thị."
                      />
                    </div>

                    {item.questionType === "MULTIPLE_CHOICE" ? (
                      <div className="mt-4 space-y-2">
                        {item.options
                          .slice()
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((option) => {
                            const selected =
                              choiceAnswers[item.assignmentItemId] === option.assignmentItemOptionId;

                            return (
                              <label
                                key={option.assignmentItemOptionId}
                                className={`flex cursor-pointer items-start gap-3 rounded-[18px] border px-4 py-3 ${
                                  selected
                                    ? "border-primary bg-primary-light/40"
                                    : "border-surface-border bg-surface-page"
                                } ${isReadOnly ? "cursor-default" : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${item.assignmentItemId}`}
                                  checked={selected}
                                  disabled={isReadOnly}
                                  onChange={() =>
                                    setChoiceAnswers((prev) => ({
                                      ...prev,
                                      [item.assignmentItemId]: option.assignmentItemOptionId,
                                    }))
                                  }
                                />
                                <RichContentRenderer
                                  content={option.content}
                                  emptyText="Lựa chọn"
                                  className="text-sm text-text-body"
                                />
                              </label>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <textarea
                          value={essayAnswers[item.assignmentItemId] ?? ""}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            setEssayAnswers((prev) => ({
                              ...prev,
                              [item.assignmentItemId]: e.target.value,
                            }))
                          }
                          placeholder="Nhập câu trả lời của bạn..."
                          className="min-h-[140px] w-full rounded-[18px] border border-surface-border bg-surface-page px-4 py-3 text-sm text-text-body outline-none focus:border-primary disabled:opacity-80"
                        />
                      </div>
                    )}

                    {isReadOnly && savedAnswer && (
                      <div className="mt-4 rounded-[18px] bg-surface-page px-4 py-3 text-sm">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                          Kết quả đã lưu
                        </p>
                        <p className="mt-1 text-text-body">
                          {item.questionType === "ESSAY"
                            ? savedAnswer.answerText || "Không có nội dung."
                            : savedAnswer.selectedOptionIds?.length
                              ? `Đã chọn ${savedAnswer.selectedOptionIds.length} đáp án`
                              : "Chưa chọn đáp án"}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
          </section>

          {!isReadOnly && (
            <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
              <p className="text-sm text-text-muted">
                Hãy lưu bài làm trước khi nộp để tránh mất dữ liệu.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={saveAnswers}
                  disabled={isSaving || isSubmitting}
                  className="flex-1 rounded-[16px] border border-surface-border bg-white py-3 text-sm font-semibold text-text-body disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  onClick={submitAttempt}
                  disabled={isSubmitting || isSaving}
                  className="flex-1 rounded-[16px] bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Đang nộp..." : "Nộp bài"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SubmissionAttemptPage;
