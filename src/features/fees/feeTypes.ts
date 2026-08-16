import type {
  FeeRecordResponse,
  FeeStatus,
  PaymentMethod,
  PaymentResponse,
  TransactionStatus,
} from "@/core/auth/authTypes";

export type {
  FeeRecordResponse,
  FeeStatus,
  PaymentMethod,
  PaymentResponse,
  TransactionStatus,
};

export interface BankTransferQrResponse {
  paymentId: number;
  paymentCode: string;
  amount: number | string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  transferContent?: string | null;
  qrContent?: string | null;
  qrImage?: string | null;
  expiresAt?: string | null;
  status?: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | null;

  // Legacy / mismatched fields kept as optional fallbacks so the UI can
  // tolerate old payload shapes while we align the app with backend/web.
  qrImageUrl?: string | null;
  bankBin?: string | null;
  accountNo?: string | null;
  accountName?: string | null;
  description?: string | null;
}

export type PaymentConceptualState =
  | "IDLE"
  | "CHECKING_PENDING"
  | "CONFIRMING"
  | "CREATING_PAYMENT"
  | "LOADING_QR"
  | "CANCELLING_PAYMENT"
  | "SUCCESS"
  | "EXPIRED";

export const FEE_STATUS_META: Record<
  FeeStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  UNPAID: {
    label: "Chưa thanh toán",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  PARTIAL: {
    label: "Thanh toán một phần",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  PAID: {
    label: "Đã thanh toán",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  OVERDUE: {
    label: "Quá hạn thanh toán",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};
