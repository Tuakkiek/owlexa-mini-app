import React from "react";
import { FEE_STATUS_META, type FeeRecordResponse } from "../feeTypes";

interface FeeCardListProps {
  fees: FeeRecordResponse[];
  isLoading: boolean;
  onPayQr: (feeRecord: FeeRecordResponse) => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

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
            className="h-36 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
          />
        ))}
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          OK
        </div>
        <p className="mt-4 text-sm font-semibold text-text-heading">
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
            className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-text-heading">
                  {item.className}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  Hạn nộp: {item.dueDate}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
              >
                {meta.label}
              </span>
            </div>

            <div className="mt-4 space-y-2 rounded-[20px] bg-surface-page p-4 text-sm">
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

              <div className="flex items-center justify-between border-t border-surface-border pt-2">
                <span className="font-medium text-text-body">Còn nợ</span>
                <span className={`text-base font-bold ${isPaid ? "text-emerald-700" : "text-primary"}`}>
                  {formatMoney(remaining)}
                </span>
              </div>
            </div>

            {!isPaid && (
              <button
                onClick={() => onPayQr(item)}
                className="mt-4 w-full rounded-[16px] bg-primary py-3 text-sm font-semibold text-white"
              >
                Thanh toán bằng QR
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
};
