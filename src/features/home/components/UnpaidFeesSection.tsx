import React from "react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import type { FeeRecordResponse } from "@/features/fees/feeTypes";

interface UnpaidFeesSectionProps {
  fees: FeeRecordResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export const UnpaidFeesSection: React.FC<UnpaidFeesSectionProps> = ({
  fees,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  const unpaidFees = fees.filter((fee) => fee.status !== "PAID");
  const totalUnpaidAmount = unpaidFees.reduce((sum, fee) => {
    const discount = fee.discountAmount || 0;
    return sum + Math.max(fee.amount - discount - fee.paidAmount, 0);
  }, 0);

  return (
    <section className="rounded-[24px] border border-surface-border bg-surface-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Học phí
          </p>
          <h3 className="mt-1 text-base font-bold text-text-heading">
            Trạng thái thanh toán
          </h3>
        </div>
        <button
          onClick={() => navigate(PATHS.FEES)}
          className="rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary"
        >
          Mở chi tiết
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 h-[110px] animate-pulse rounded-[20px] bg-surface-page" />
      ) : error ? (
        <div className="mt-4 rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          <p>{error}</p>
          <button onClick={onRetry} className="mt-3 font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : unpaidFees.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            Bạn đã hoàn thành toàn bộ học phí.
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Hiện chưa có khoản nào cần thanh toán thêm.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-card border border-surface-border bg-primary-light p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-amber-700">
                Cần đóng
              </p>
              <p className="mt-2 text-2xl font-bold text-text-heading">
                {formatMoney(totalUnpaidAmount)}
              </p>
            </div>
            <div className="rounded-[18px] bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                Hóa đơn mở
              </p>
              <p className="mt-1 text-lg font-bold text-primary">
                {unpaidFees.length}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {unpaidFees.slice(0, 2).map((fee) => {
              const remaining = Math.max(
                fee.amount - (fee.discountAmount || 0) - fee.paidAmount,
                0,
              );

              return (
                <div
                  key={fee.id}
                  className="flex items-center justify-between rounded-[16px] bg-white/85 px-4 py-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text-heading">
                      {fee.className}
                    </p>
                    <p className="mt-1 text-text-muted">Hạn nộp: {fee.dueDate}</p>
                  </div>
                  <p className="ml-3 whitespace-nowrap font-bold text-primary">
                    {formatMoney(remaining)}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate(PATHS.FEES)}
            className="mt-4 w-full rounded-[16px] bg-primary py-3 text-sm font-semibold text-white"
          >
            Xem học phí và thanh toán QR
          </button>
        </div>
      )}
    </section>
  );
};
