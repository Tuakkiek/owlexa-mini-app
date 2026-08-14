import React from "react";
import { CalendarDays, Wallet } from "lucide-react";

interface HomeStatsProps {
  weeklySessionCount: number;
  isSchedulesLoading: boolean;
  schedulesError: string | null;
  totalDue: number;
  unpaidFeeCount: number;
  isFeesLoading: boolean;
  feesError: string | null;
}

const formatMoney = (amount: number) => {
  const formatted = amount.toLocaleString("vi-VN");
  return `${formatted} đ`;
};

export const HomeStats: React.FC<HomeStatsProps> = ({
  weeklySessionCount,
  isSchedulesLoading,
  schedulesError,
  totalDue,
  unpaidFeeCount,
  isFeesLoading,
  feesError,
}) => {
  return (
    <section className="grid grid-cols-2 gap-3">
      {/* Weekly Sessions Card */}
      <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <p className="mt-3 text-xs font-medium text-text-muted">Ca học / tuần</p>
          <p className="mt-1 text-2xl font-bold text-text-heading">
            {isSchedulesLoading ? "..." : weeklySessionCount}
          </p>
        </div>
        <p className="mt-2 text-xs text-text-muted truncate">
          {schedulesError ? "Chưa lấy được dữ liệu" : "Lịch được đồng bộ tự động"}
        </p>
      </div>

      {/* Outstanding Fee Card */}
      <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="mt-3 text-xs font-medium text-text-muted">Học phí còn nợ</p>
          <p className="mt-1 truncate text-lg font-bold text-text-heading">
            {isFeesLoading ? "..." : formatMoney(totalDue)}
          </p>
        </div>
        <p className="mt-2 text-xs text-text-muted truncate">
          {feesError
            ? "Chưa lấy được dữ liệu"
            : `${unpaidFeeCount} hóa đơn cần theo dõi`}
        </p>
      </div>
    </section>
  );
};

export default HomeStats;
