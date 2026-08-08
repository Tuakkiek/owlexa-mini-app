export type DocumentType = "PDF" | "VIDEO" | "OTHER";

export interface StudentDocumentResponse {
  id: number;
  title: string;
  type: DocumentType;
  uploadedAt: string;
  url: string;
  classId: number;
  className: string;
  uploaderName?: string;
  description?: string;
}

export const DOCUMENT_TYPE_META: Record<
  DocumentType,
  { label: string; badgeClass: string; actionLabel: string }
> = {
  PDF: {
    label: "PDF",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    actionLabel: "Mở PDF",
  },
  VIDEO: {
    label: "Video",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    actionLabel: "Mở video",
  },
  OTHER: {
    label: "Tài liệu",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
    actionLabel: "Mở tài liệu",
  },
};
