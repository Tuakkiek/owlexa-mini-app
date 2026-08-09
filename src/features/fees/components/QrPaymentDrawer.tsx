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

const formatMoney = (amount: number | string) => {
  const numericAmount =
    typeof amount === "number" ? amount : Number(String(amount).replace(/,/g, ""));

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
};

const normalizeQrData = (qrData: BankTransferQrResponse | null) => {
  if (!qrData) return null;

  return {
    imageSrc: qrData.qrImage || qrData.qrImageUrl || qrData.qrContent || "",
    bankLabel: qrData.bankName || qrData.bankBin || "Đang cập nhật",
    accountHolder: qrData.accountHolder || qrData.accountName || "",
    accountNumber: qrData.accountNumber || qrData.accountNo || "",
    transferContent: qrData.transferContent || qrData.description || "",
    amount: qrData.amount,
  };
};

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

  const displayQr = normalizeQrData(qrData);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
      <div className="absolute inset-0" onClick={() => !isBusy && onClose()} />

      <div
        className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-card border-t border-surface-border bg-white p-6 shadow-md"
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
            aria-label="Đóng thanh toán QR"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-text-muted disabled:opacity-50"
          >
            x
          </button>
        </div>

        {feedbackMessage && (
          <div className="mt-4 rounded-card border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
            {feedbackMessage}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-card border border-error/20 bg-red-50 p-3 text-sm text-error">
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
        ) : displayQr ? (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-card border border-surface-border bg-white p-3 shadow-sm">
                {displayQr.imageSrc ? (
                  <img
                    src={displayQr.imageSrc}
                    alt="VietQR Code"
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-sm text-text-muted">
                    Không có ảnh QR
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Quét mã bằng ứng dụng ngân hàng hỗ trợ VietQR
              </p>
            </div>

            <div className="space-y-3 rounded-card border border-surface-border bg-surface-page p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-muted">Ngân hàng</span>
                <span className="text-right font-semibold text-text-heading">
                  {displayQr.bankLabel}
                  {displayQr.accountHolder ? ` (${displayQr.accountHolder})` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-heading">
                    {displayQr.accountNumber || "Đang cập nhật"}
                  </span>
                  <button
                    onClick={() => displayQr.accountNumber && onCopy(displayQr.accountNumber, "số tài khoản")}
                    disabled={!displayQr.accountNumber}
                    className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary disabled:opacity-50"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Số tiền</span>
                <span className="font-bold text-primary">
                  {formatMoney(displayQr.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-3">
                <span className="text-text-muted">Nội dung CK</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-heading">
                    {displayQr.transferContent || "Đang cập nhật"}
                  </span>
                  <button
                    onClick={() => displayQr.transferContent && onCopy(displayQr.transferContent, "nội dung chuyển khoản")}
                    disabled={!displayQr.transferContent}
                    className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary disabled:opacity-50"
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
                  className="min-h-12 w-full rounded-btn border border-error/20 bg-red-50 py-3 text-sm font-semibold text-error"
                >
                  Hủy giao dịch đang chờ
                </button>
              )}

              <button
                onClick={onClose}
                className="min-h-12 w-full rounded-btn border border-surface-border bg-white py-3 text-sm font-semibold text-text-body"
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
