import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "zmp-ui";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { PATHS } from "@/router/routes";
import { ProfileSummarySection } from "../components/ProfileSummarySection";
import { NextSchedulesSection } from "../components/NextSchedulesSection";
import { UnpaidFeesSection } from "../components/UnpaidFeesSection";
import { ActiveAssignmentsSection } from "../components/ActiveAssignmentsSection";
import { RecentDocumentsSection } from "../components/RecentDocumentsSection";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";
import type { FeeRecordResponse } from "@/features/fees/feeTypes";
import type { StudentAssignmentListResponse } from "@/features/assignments/assignmentTypes";
import type { StudentDocumentResponse } from "@/features/documents/documentTypes";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  const [fees, setFees] = useState<FeeRecordResponse[]>([]);
  const [isFeesLoading, setIsFeesLoading] = useState(true);
  const [feesError, setFeesError] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<StudentAssignmentListResponse[]>([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<StudentDocumentResponse[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsSchedulesLoading(true);
      setSchedulesError(null);
      const res = await httpClient.get<ScheduleResponse[]>("/student/schedules/me", {
        signal,
        allowAuthReplay: true,
      });
      setSchedules(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setSchedulesError(apiErr.message || "Không thể tải lịch học.");
    } finally {
      setIsSchedulesLoading(false);
    }
  }, []);

  const fetchFees = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsFeesLoading(true);
      setFeesError(null);
      const res = await httpClient.get<FeeRecordResponse[]>("/fee-records/me", {
        signal,
        allowAuthReplay: true,
      });
      setFees(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setFeesError(apiErr.message || "Không thể tải học phí.");
    } finally {
      setIsFeesLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsAssignmentsLoading(true);
      setAssignmentsError(null);
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
      setAssignmentsError(apiErr.message || "Không thể tải bài tập.");
    } finally {
      setIsAssignmentsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsDocumentsLoading(true);
      setDocumentsError(null);
      const res = await httpClient.get<StudentDocumentResponse[]>("/student/documents", {
        signal,
        allowAuthReplay: true,
      });
      setDocuments(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setDocumentsError(apiErr.message || "Không thể tải tài liệu.");
    } finally {
      setIsDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSchedules(controller.signal);
    fetchFees(controller.signal);
    fetchAssignments(controller.signal);
    fetchDocuments(controller.signal);
    return () => controller.abort();
  }, [fetchAssignments, fetchDocuments, fetchFees, fetchSchedules]);

  const unpaidFees = fees.filter((fee) => fee.status !== "PAID");
  const totalDue = unpaidFees.reduce((sum, fee) => {
    const discount = fee.discountAmount || 0;
    return sum + Math.max(fee.amount - discount - fee.paidAmount, 0);
  }, 0);

  const quickActions = [
    {
      title: "Xem lịch học",
      description: "Theo dõi ca học trong tuần",
      path: PATHS.SCHEDULE,
    },
    {
      title: "Xem điểm danh",
      description: "Kiểm tra trạng thái có mặt theo lớp",
      path: PATHS.ATTENDANCE,
    },
    {
      title: "Bài tập của tôi",
      description: "Theo dõi bài được giao và deadline",
      path: PATHS.ASSIGNMENTS,
    },
    {
      title: "Tài liệu học tập",
      description: "Mở PDF, video và tài liệu lớp học",
      path: PATHS.DOCUMENTS,
    },
    {
      title: "Thanh toán QR",
      description: "Mở hóa đơn và quét VietQR",
      path: PATHS.FEES,
    },
  ];

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <ProfileSummarySection />

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-surface-border bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
            Ca học / tuần
          </p>
          <p className="mt-3 text-2xl font-bold text-text-heading">
            {isSchedulesLoading ? "..." : schedules.length}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {schedulesError ? "Chưa lấy được dữ liệu" : "Lịch được đồng bộ tự động"}
          </p>
        </div>
        <div className="rounded-[22px] border border-surface-border bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
            Học phí còn nợ
          </p>
          <p className="mt-3 text-lg font-bold text-text-heading">
            {isFeesLoading ? "..." : formatMoney(totalDue)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {feesError ? "Chưa lấy được dữ liệu" : `${unpaidFees.length} hóa đơn cần theo dõi`}
          </p>
        </div>
      </section>

      <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Truy cập nhanh
            </p>
            <h3 className="mt-1 text-base font-bold text-text-heading">
              Tác vụ học viên hay dùng
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex w-full items-center justify-between rounded-[18px] border border-surface-border bg-surface-page px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-text-heading">
                  {action.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {action.description}
                </p>
              </div>
              <span className="text-lg font-semibold text-primary">›</span>
            </button>
          ))}
        </div>
      </section>

      <ActiveAssignmentsSection
        assignments={assignments}
        isLoading={isAssignmentsLoading}
        error={assignmentsError}
        onRetry={() => fetchAssignments()}
      />

      <RecentDocumentsSection
        documents={documents}
        isLoading={isDocumentsLoading}
        error={documentsError}
        onRetry={() => fetchDocuments()}
      />

      <NextSchedulesSection
        schedules={schedules}
        isLoading={isSchedulesLoading}
        error={schedulesError}
        onRetry={() => fetchSchedules()}
      />

      <UnpaidFeesSection
        fees={fees}
        isLoading={isFeesLoading}
        error={feesError}
        onRetry={() => fetchFees()}
      />
    </div>
  );
};

export default HomePage;
