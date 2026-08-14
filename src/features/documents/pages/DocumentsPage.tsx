import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCw, Search, ExternalLink } from "lucide-react";
import { httpClient, type AppApiError } from "@/core/api/httpClient";
import {
  DOCUMENT_TYPE_META,
  type DocumentType,
  type StudentDocumentResponse,
} from "../documentTypes";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<StudentDocumentResponse[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | "all">("all");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await httpClient.get<StudentDocumentResponse[]>("/student/documents", {
        signal,
        allowAuthReplay: true,
      });
      setDocuments(res.data);
    } catch (err: any) {
      if (err?.kind === "REQUEST_ABORTED") return;
      const apiErr = err as AppApiError;
      setError(apiErr.message || "Không thể tải tài liệu học tập.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDocuments(controller.signal);
    return () => controller.abort();
  }, [fetchDocuments]);

  const classOptions = useMemo(() => {
    return Array.from(
      new Map(documents.map((doc) => [doc.classId, doc.className])).entries(),
    ).map(([classId, className]) => ({ classId, className }));
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchClass = selectedClassId === "all" || doc.classId === selectedClassId;
      const matchType = selectedType === "all" || doc.type === selectedType;
      const matchSearch =
        normalizedSearch.length === 0 ||
        doc.title.toLowerCase().includes(normalizedSearch) ||
        doc.className.toLowerCase().includes(normalizedSearch) ||
        (doc.description?.toLowerCase().includes(normalizedSearch) ?? false);

      return matchClass && matchType && matchSearch;
    });
  }, [documents, searchTerm, selectedClassId, selectedType]);

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <section className="rounded-[24px] bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_58%,#dbeafe_100%)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Tài liệu
            </p>
            <h1 className="mt-1 text-[24px] font-bold leading-tight text-text-heading">
              Thư viện học tập
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Xem tài liệu học tập, file PDF và video giáo viên đã chia sẻ cho lớp của bạn.
            </p>
          </div>
          <button
            onClick={() => fetchDocuments()}
            disabled={isLoading}
            aria-label="Làm mới"
            className="flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-text-body disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Tổng tài liệu
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : documents.length}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Lớp học
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : classOptions.length}
            </p>
          </div>
          <div className="rounded-[18px] border border-surface-border bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
              Kết quả lọc
            </p>
            <p className="mt-2 text-xl font-bold text-text-heading">
              {isLoading ? "..." : filteredDocuments.length}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[18px] border border-error/20 bg-red-50 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <section className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm">
        <div className="grid gap-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên tài liệu, lớp học, mô tả..."
                className="h-12 w-full rounded-[16px] border border-surface-border bg-white pl-10 pr-4 text-sm text-text-heading outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Lớp học
              </label>
              <select
                value={selectedClassId}
                onChange={(e) =>
                  setSelectedClassId(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
              >
                <option value="all">Tất cả lớp</option>
                {classOptions.map((option) => (
                  <option key={option.classId} value={option.classId}>
                    {option.className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Loại tài liệu
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType | "all")}
                className="h-12 w-full rounded-[16px] border border-surface-border bg-white px-4 text-sm text-text-heading outline-none focus:border-primary"
              >
                <option value="all">Tất cả</option>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Video</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-36 animate-pulse rounded-[24px] border border-surface-border bg-white p-4"
            />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-surface-border bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-text-heading">
            Không có tài liệu phù hợp
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Hãy thử đổi bộ lọc hoặc chờ giáo viên chia sẻ thêm tài liệu mới.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const meta = DOCUMENT_TYPE_META[doc.type];

            return (
              <article
                key={doc.id}
                className="rounded-[24px] border border-surface-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="rounded-full bg-surface-page px-2.5 py-1 text-[10px] font-semibold text-text-body">
                        {doc.className}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-text-heading">
                      {doc.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {doc.description?.trim() || "Chưa có mô tả cho tài liệu này."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-surface-page px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      Ngày đăng
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-heading">
                      {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-surface-page px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      Người đăng
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-heading">
                      {doc.uploaderName || "Giáo viên / trung tâm"}
                    </p>
                  </div>
                </div>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-primary py-3 text-sm font-semibold text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{meta.actionLabel}</span>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
