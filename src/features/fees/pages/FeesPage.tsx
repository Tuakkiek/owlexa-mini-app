import React, { useCallback, useEffect, useState } from "react";
import { Wallet, Receipt, RotateCw } from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { FeeCardList } from "../components/FeeCardList";
import { QrPaymentDrawer } from "../components/QrPaymentDrawer";
import { useFeePayment } from "../useFeePayment";
import type { FeeRecordResponse } from "../feeTypes";

const formatMoney = (amount: number) => {
  const formatted = amount.toLocaleString("vi-VN");
  return `${formatted} đ`;
};

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
    <div className="mx-auto max-w-[520px] space-y-4 px-4 pb-6 pt-2">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            HỌC PHÍ
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-heading">
            Học phí của bạn
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Theo dõi công nợ và thanh toán nhanh bằng VietQR
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchFees()}
          disabled={isLoading}
          aria-label="Làm mới"
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-surface-border bg-white text-text-heading shadow-sm transition-colors hover:bg-surface-hover active:bg-gray-100 disabled:opacity-50"
        >
          <RotateCw className={`h-5 w-5 text-gray-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* Summary Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Còn phải đóng</p>
            <p className="mt-1 truncate text-lg font-bold text-text-heading">
              {isLoading ? "..." : formatMoney(totalDue)}
            </p>
          </div>
          <p className="mt-2 text-xs text-text-muted truncate">
            {fees.length} khoản phí trong hồ sơ
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Hóa đơn mở</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {isLoading ? "..." : unpaidFees.length}
            </p>
          </div>
          <p className="mt-2 text-xs text-primary font-medium truncate">
            {unpaidFees.length > 0 ? "Cần thanh toán" : "Đã hoàn thành"}
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[16px] border border-error/20 bg-red-50 p-4 text-xs text-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchFees()}
            className="mt-2 font-semibold underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Fees List */}
      <FeeCardList
        fees={fees}
        isLoading={isLoading}
        onPayQr={paymentControl.startQrPayment}
      />

      {/* VietQR Payment Drawer */}
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
