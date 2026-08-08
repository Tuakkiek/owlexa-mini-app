import { useState } from "react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import { generateSecureUUIDv4 } from "@/core/utils/cryptoUtils";
import type {
  BankTransferQrResponse,
  FeeRecordResponse,
  PaymentConceptualState,
  PaymentResponse,
} from "./feeTypes";

export function useFeePayment(onPaymentChanged?: () => void) {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<FeeRecordResponse | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [qrData, setQrData] = useState<BankTransferQrResponse | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentConceptualState>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const fetchQrForPayment = async (paymentId: number) => {
    setPaymentState("LOADING_QR");
    const res = await httpClient.get<BankTransferQrResponse>(
      `/student/payments/${paymentId}/qr`,
      { allowAuthReplay: true },
    );
    setQrData(res.data);
    setPaymentState("IDLE");
  };

  const startQrPayment = async (feeRecord: FeeRecordResponse) => {
    setSelectedFeeRecord(feeRecord);
    setIsOpenDrawer(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      setPaymentState("CHECKING_PENDING");
      const pendingRes = await httpClient.get<PaymentResponse>(
        `/student/fee-record/${feeRecord.id}/payments/pending`,
        {
          validateStatus: (status) => status === 200 || status === 204,
          allowAuthReplay: true,
        },
      );

      if (pendingRes.status === 200 && pendingRes.data) {
        setCurrentPayment(pendingRes.data);
        await fetchQrForPayment(pendingRes.data.id);
        return;
      }

      setPaymentState("CREATING_PAYMENT");
      const key = idempotencyKey || generateSecureUUIDv4();
      setIdempotencyKey(key);

      const createRes = await httpClient.post<PaymentResponse>(
        `/student/fee-record/${feeRecord.id}/payments/qr`,
        null,
        {
          headers: { "Idempotency-Key": key },
          allowAuthReplay: true,
        },
      );

      const newPayment = createRes.data;
      setCurrentPayment(newPayment);
      await fetchQrForPayment(newPayment.id);
    } catch (err: any) {
      setPaymentState("IDLE");
      const apiErr = err as AppApiError;
      setError(
        apiErr.message || "Không thể tạo thông tin thanh toán QR. Vui lòng thử lại.",
      );
    }
  };

  const cancelPendingPayment = async () => {
    if (!currentPayment) return;

    try {
      setPaymentState("CANCELLING_PAYMENT");
      setError(null);
      await httpClient.post(
        `/student/payments/${currentPayment.id}/cancel`,
        null,
        { allowAuthReplay: false },
      );
      closeDrawer();
      setFeedbackMessage("Đã hủy giao dịch thành công.");
      onPaymentChanged?.();
    } catch (err: any) {
      setPaymentState("IDLE");
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể hủy giao dịch thanh toán.");
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setFeedbackMessage(`Đã sao chép ${label}.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setError(`Không thể sao chép ${label}.`);
    }
  };

  const closeDrawer = () => {
    setIsOpenDrawer(false);
    setSelectedFeeRecord(null);
    setCurrentPayment(null);
    setQrData(null);
    setPaymentState("IDLE");
    setError(null);
    setIdempotencyKey(null);
  };

  return {
    isOpenDrawer,
    selectedFeeRecord,
    currentPayment,
    qrData,
    paymentState,
    error,
    feedbackMessage,
    startQrPayment,
    cancelPendingPayment,
    copyToClipboard,
    closeDrawer,
  };
}
