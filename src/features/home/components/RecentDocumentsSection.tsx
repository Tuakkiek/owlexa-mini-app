import React from "react";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import {
  DOCUMENT_TYPE_META,
  type StudentDocumentResponse,
} from "@/features/documents/documentTypes";

interface RecentDocumentsSectionProps {
  documents: StudentDocumentResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));

export const RecentDocumentsSection: React.FC<RecentDocumentsSectionProps> = ({
  documents,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const recentDocuments = documents.slice(0, 3);

  return (
    <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Tài liệu
          </p>
          <h3 className="mt-1 text-base font-bold text-text-heading">
            Mới được chia sẻ
          </h3>
        </div>
        <button
          onClick={() => navigate(PATHS.DOCUMENTS)}
          className="rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary"
        >
          Mở thư viện
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-[84px] animate-pulse rounded-[20px] bg-surface-page" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          <p>{error}</p>
          <button onClick={onRetry} className="mt-3 font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : recentDocuments.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-dashed border-surface-border bg-surface-page px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-heading">
            Chưa có tài liệu mới
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Tài liệu lớp học sẽ xuất hiện ở đây khi được giáo viên chia sẻ.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {recentDocuments.map((doc) => {
            const meta = DOCUMENT_TYPE_META[doc.type];

            return (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[20px] border border-surface-border bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {doc.className}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-text-heading">
                      {doc.title}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Đăng ngày {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <ExternalLink className="ml-3 h-4 w-4 shrink-0 text-primary" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecentDocumentsSection;
