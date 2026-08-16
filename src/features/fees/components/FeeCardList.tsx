import React from "react";
import { QrCode, Calendar, CircleCheck } from "lucide-react";
import { FEE_STATUS_META, type FeeRecordResponse } from "../feeTypes";

interface FeeCardListProps {
  fees: FeeRecordResponse[];
  isLoading: boolean;
  onPayQr: (feeRecord: FeeRecordResponse) => void;
}

const formatMoney = (amount: number) => {
  const formatted = amount.toLocaleString("vi-VN");
  return `${formatted} đ`;
};

export const FeeCardList: React.FC<FeeCardListProps> = ({
  fees,
  isLoading,
  onPayQr,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="h-[140px] animate-pulse rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-surface-border bg-white px-4 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-text-heading">
          Bạn đã hoàn thành tất cả các khoản học phí
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Không còn hóa đơn nào cần xử lý tại thời điểm này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fees.map((item) => {
        const meta = FEE_STATUS_META[item.status] || FEE_STATUS_META.UNPAID;
        const discount = item.discountAmount || 0;
        const remaining = Math.max(item.amount - discount - item.paidAmount, 0);
        const isPaid = item.status === "PAID" || remaining <= 0;

        return (
          <article
            key={item.id}
            className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-text-heading truncate">
                  {item.className}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <span>Hạn nộp: {item.dueDate}</span>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.03em] shrink-0 ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
              >
                {meta.label}
              </span>
            </div>

            <div className="mt-3 space-y-2 rounded-[12px] bg-surface-page p-3.5 text-xs">
              <div className="flex items-center justify-between text-text-body">
                <span>Tổng học phí</span>
                <span className="font-semibold text-text-heading">
                  {formatMoney(item.amount)}
                </span>
              </div>

              {item.paidAmount > 0 && (
                <div className="flex items-center justify-between text-text-body">
                  <span>Đã thanh toán</span>
                  <span className="font-semibold text-emerald-700">
                    {formatMoney(item.paidAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-surface-border/80 pt-2">
                <span className="font-medium text-text-body">Còn nợ</span>
                <span
                  className={`text-sm font-bold ${
                    isPaid ? "text-emerald-700" : "text-primary"
                  }`}
                >
                  {formatMoney(remaining)}
                </span>
              </div>
            </div>

            {!isPaid && (
              <button
                type="button"
                onClick={() => onPayQr(item)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover active:bg-orange-700"
              >
                <QrCode className="h-4 w-4" />
                <span>Thanh toán bằng QR</span>
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default FeeCardList;
