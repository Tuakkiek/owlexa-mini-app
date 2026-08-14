import React, { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/core/auth/authStore";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { HomeHeader } from "../components/HomeHeader";
import { StudentInfoCard } from "../components/StudentInfoCard";
import { HomeStats } from "../components/HomeStats";
import { QuickAccessSection } from "../components/QuickAccessSection";
import { UpcomingScheduleSection } from "../components/UpcomingScheduleSection";
import { ActiveAssignmentsSection } from "../components/ActiveAssignmentsSection";
import { RecentDocumentsSection } from "../components/RecentDocumentsSection";
import { UnpaidFeesSection } from "../components/UnpaidFeesSection";
import type { ScheduleResponse } from "@/features/schedule/scheduleTypes";
import type { FeeRecordResponse } from "@/features/fees/feeTypes";
import type { StudentAssignmentListResponse } from "@/features/assignments/assignmentTypes";
import type { StudentDocumentResponse } from "@/features/documents/documentTypes";

export const HomePage: React.FC = () => {
  const user = useAtomValue(userProfileAtom);

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

  return (
    <div className="mx-auto max-w-[520px] space-y-5 px-4 pb-6 pt-2">
      <HomeHeader user={user} />

      <StudentInfoCard user={user} />

      <HomeStats
        weeklySessionCount={schedules.length}
        isSchedulesLoading={isSchedulesLoading}
        schedulesError={schedulesError}
        totalDue={totalDue}
        unpaidFeeCount={unpaidFees.length}
        isFeesLoading={isFeesLoading}
        feesError={feesError}
      />

      <QuickAccessSection />

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

      <UpcomingScheduleSection
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
