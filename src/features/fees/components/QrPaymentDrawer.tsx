import React from "react";
import { X, Copy, QrCode, AlertCircle, CircleCheck } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-[1px]">
      <div
        className="absolute inset-0"
        onClick={() => !isBusy && onClose()}
      />

      <div
        className="relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-card border-t border-surface-border bg-white p-5 shadow-xl"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-primary-light text-primary">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                MÃ VIETQR THANH TOÁN
              </span>
              <h3 className="text-sm font-bold text-text-heading truncate">
                {selectedFeeRecord?.className || "Học phí lớp học"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Đóng thanh toán QR"
            className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-surface-hover text-text-muted transition-colors hover:text-text-heading disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {feedbackMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            <CircleCheck className="h-4 w-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-center gap-2 rounded-[12px] border border-error/20 bg-red-50 p-3 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isBusy ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-3 text-xs font-medium text-text-body">
              {paymentState === "CHECKING_PENDING" && "Đang kiểm tra giao dịch đang chờ..."}
              {paymentState === "CREATING_PAYMENT" && "Đang tạo yêu cầu thanh toán VietQR..."}
              {paymentState === "LOADING_QR" && "Đang tải mã VietQR..."}
              {paymentState === "CANCELLING_PAYMENT" && "Đang hủy giao dịch..."}
            </p>
          </div>
        ) : displayQr ? (
          <div className="space-y-4 pt-4">
            {/* QR Image Box */}
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-card border border-surface-border bg-white p-3 shadow-sm">
                {displayQr.imageSrc ? (
                  <img
                    src={displayQr.imageSrc}
                    alt="VietQR Code"
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-xs text-text-muted">
                    Không có ảnh QR
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Quét mã bằng ứng dụng ngân hàng hỗ trợ VietQR
              </p>
            </div>

            {/* Bank Transfer Details */}
            <div className="space-y-3 rounded-[12px] border border-surface-border bg-surface-page p-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-muted">Ngân hàng</span>
                <span className="text-right font-semibold text-text-heading truncate">
                  {displayQr.bankLabel}
                  {displayQr.accountHolder ? ` (${displayQr.accountHolder})` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border/80 pt-2.5">
                <span className="text-text-muted">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-heading">
                    {displayQr.accountNumber || "Đang cập nhật"}
                  </span>
                  <button
                    type="button"
                    onClick={() => displayQr.accountNumber && onCopy(displayQr.accountNumber, "số tài khoản")}
                    disabled={!displayQr.accountNumber}
                    className="flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-orange-100 disabled:opacity-50"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Sao chép</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border/80 pt-2.5">
                <span className="text-text-muted">Số tiền</span>
                <span className="font-bold text-primary text-sm">
                  {formatMoney(displayQr.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-surface-border/80 pt-2.5">
                <span className="text-text-muted">Nội dung CK</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-text-heading truncate">
                    {displayQr.transferContent || "Đang cập nhật"}
                  </span>
                  <button
                    type="button"
                    onClick={() => displayQr.transferContent && onCopy(displayQr.transferContent, "nội dung chuyển khoản")}
                    disabled={!displayQr.transferContent}
                    className="flex items-center gap-1 shrink-0 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-orange-100 disabled:opacity-50"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Sao chép</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {currentPayment && currentPayment.status === "PENDING" && (
                <button
                  type="button"
                  onClick={onCancelPayment}
                  className="w-full rounded-[12px] border border-error/20 bg-red-50 py-2.5 text-xs font-semibold text-error transition-colors hover:bg-red-100"
                >
                  Hủy giao dịch đang chờ
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[12px] border border-surface-border bg-white py-2.5 text-xs font-semibold text-text-heading transition-colors hover:bg-surface-hover"
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

export default QrPaymentDrawer;
