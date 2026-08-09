import React from "react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import {
  ASSIGNMENT_TYPE_LABEL,
  type StudentAssignmentListResponse,
} from "@/features/assignments/assignmentTypes";

interface ActiveAssignmentsSectionProps {
  assignments: StudentAssignmentListResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "Chưa đặt";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const ActiveAssignmentsSection: React.FC<ActiveAssignmentsSectionProps> = ({
  assignments,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const highlighted = assignments
    .filter((item) => item.status === "ACTIVE" || item.status === "SCHEDULED")
    .slice(0, 3);

  return (
    <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Bài tập
          </p>
          <h3 className="mt-1 text-base font-bold text-text-heading">
            Cần chú ý hôm nay
          </h3>
        </div>
        <button
          onClick={() => navigate(PATHS.ASSIGNMENTS)}
          className="rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary"
        >
          Xem tất cả
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-[92px] animate-pulse rounded-[20px] bg-surface-page" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          <p>{error}</p>
          <button onClick={onRetry} className="mt-3 font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : highlighted.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-dashed border-surface-border bg-surface-page px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-heading">
            Không có bài tập đang mở
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Khi giáo viên giao bài mới, mục này sẽ hiện ngay trên trang chủ.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {highlighted.map((assignment) => (
            <button
              key={assignment.recipientId}
              onClick={() => navigate(PATHS.ASSIGNMENTS)}
              className="flex w-full items-start justify-between rounded-card border border-surface-border bg-white p-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    {ASSIGNMENT_TYPE_LABEL[assignment.type]}
                  </span>
                  {assignment.hasPassword && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      Có mật khẩu
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-text-heading">
                  {assignment.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Hạn nộp: {formatDateTime(assignment.dueAt)}
                </p>
              </div>
              <span className="ml-3 text-lg font-semibold text-primary">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActiveAssignmentsSection;
