import React, { useCallback, useEffect, useState } from "react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { FeeCardList } from "../components/FeeCardList";
import { QrPaymentDrawer } from "../components/QrPaymentDrawer";
import { useFeePayment } from "../useFeePayment";
import type { FeeRecordResponse } from "../feeTypes";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeRecordResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<FeeRecordResponse[]>("/fee-records/me", {
        signal,
        allowAuthReplay: true,
      });
      setFees(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải danh sách học phí.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFees(controller.signal);
    return () => controller.abort();
  }, [fetchFees]);

  const paymentControl = useFeePayment(() => {
    fetchFees();
  });

  const unpaidFees = fees.filter((fee) => fee.status !== "PAID");
  const totalDue = unpaidFees.reduce((sum, fee) => {
    const discount = fee.discountAmount || 0;
    return sum + Math.max(fee.amount - discount - fee.paidAmount, 0);
  }, 0);

  return (
    <div className="mx-auto w-full max-w-[520px] space-y-6 px-4 pb-6 pt-4">
      <section className="rounded-card border border-surface-border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Thanh toán
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-text-heading">
              Học phí của bạn
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Theo dõi công nợ và thanh toán nhanh bằng mã VietQR.
            </p>
          </div>
          <button
            onClick={() => fetchFees()}
            disabled={isLoading}
            className="min-h-12 rounded-btn border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-card border border-surface-border bg-surface-page px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Còn phải đóng
            </p>
            <p className="mt-2 text-lg font-bold text-text-heading">
              {isLoading ? "..." : formatMoney(totalDue)}
            </p>
          </div>
          <div className="rounded-card border border-surface-border bg-surface-page px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Hóa đơn mở
            </p>
            <p className="mt-2 text-xl font-bold text-primary">
              {isLoading ? "..." : unpaidFees.length}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-card border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <FeeCardList
        fees={fees}
        isLoading={isLoading}
        onPayQr={paymentControl.startQrPayment}
      />

      <QrPaymentDrawer
        isOpen={paymentControl.isOpenDrawer}
        selectedFeeRecord={paymentControl.selectedFeeRecord}
        currentPayment={paymentControl.currentPayment}
        qrData={paymentControl.qrData}
        paymentState={paymentControl.paymentState}
        error={paymentControl.error}
        feedbackMessage={paymentControl.feedbackMessage}
        onClose={paymentControl.closeDrawer}
        onCancelPayment={paymentControl.cancelPendingPayment}
        onCopy={paymentControl.copyToClipboard}
      />
    </div>
  );
};

export default FeesPage;
