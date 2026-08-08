import React from "react";
import type {
  BankTransferQrResponse,
  FeeRecordResponse,
  PaymentConceptualState,
  PaymentResponse,
} from "../feeTypes";

interface QrPaymentDrawerProps {
  isOpen: boolean;
  selectedFeeRecord: FeeRecordResponse | null;
  currentPayment: PaymentResponse | null;
  qrData: BankTransferQrResponse | null;
  paymentState: PaymentConceptualState;
  error: string | null;
  feedbackMessage: string | null;
  onClose: () => void;
  onCancelPayment: () => void;
  onCopy: (text: string, label: string) => void;
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export const QrPaymentDrawer: React.FC<QrPaymentDrawerProps> = ({
  isOpen,
  selectedFeeRecord,
  currentPayment,
  qrData,
  paymentState,
  error,
  feedbackMessage,
  onClose,
  onCancelPayment,
  onCopy,
}) => {
  if (!isOpen) return null;

  const isBusy =
    paymentState === "CHECKING_PENDING" ||
    paymentState === "CREATING_PAYMENT" ||
    paymentState === "LOADING_QR" ||
    paymentState === "CANCELLING_PAYMENT";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-[1px]">
      <div className="absolute inset-0" onClick={() => !isBusy && onClose()} />

      <div
        className="relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] border-t border-surface-border bg-white p-5 shadow-xl"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Mã VietQR thanh toán
            </span>
            <h3 className="mt-1 text-base font-bold text-text-heading">
              {selectedFeeRecord?.className || "Học phí lớp học"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-text-muted disabled:opacity-50"
          >
            x
          </button>
        </div>

        {feedbackMessage && (
          <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
            {feedbackMessage}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[16px] border border-error/20 bg-red-50 p-3 text-sm text-error">
            {error}
          </div>
        )}

        {isBusy ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-3 text-sm font-medium text-text-body">
              {paymentState === "CHECKING_PENDING" && "Đang kiểm tra giao dịch đang chờ..."}
              {paymentState === "CREATING_PAYMENT" && "Đang tạo yêu cầu thanh toán VietQR..."}
              {paymentState === "LOADING_QR" && "Đang tải mã VietQR..."}
              {paymentState === "CANCELLING_PAYMENT" && "Đang hủy giao dịch..."}
            </p>
          </div>
        ) : qrData ? (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-[24px] border border-surface-border bg-white p-3 shadow-sm">
                <img
                  src={qrData.qrImageUrl}
                  alt="VietQR Code"
                  className="h-48 w-48 object-contain"
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Quét mã bằng ứng dụng ngân hàng hỗ trợ VietQR
              </p>
            </div>

            <div className="space-y-3 rounded-[22px] border border-surface-border bg-surface-page p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-muted">Ngân hàng</span>
                <span className="text-right font-semibold text-text-heading">
                  BIN {qrData.bankBin} ({qrData.accountName})
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-heading">
                    {qrData.accountNo}
                  </span>
                  <button
                    onClick={() => onCopy(qrData.accountNo, "số tài khoản")}
                    className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Số tiền</span>
                <span className="font-bold text-primary">
                  {formatMoney(qrData.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Nội dung CK</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-heading">
                    {qrData.description}
                  </span>
                  <button
                    onClick={() => onCopy(qrData.description, "nội dung chuyển khoản")}
                    className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary"
                  >
                    Sao chép
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {currentPayment && currentPayment.status === "PENDING" && (
                <button
                  onClick={onCancelPayment}
                  className="w-full rounded-[16px] border border-error/20 bg-red-50 py-3 text-sm font-semibold text-error"
                >
                  Hủy giao dịch đang chờ
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full rounded-[16px] border border-surface-border bg-white py-3 text-sm font-semibold text-text-body"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
