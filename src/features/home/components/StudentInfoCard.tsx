import React from "react";
import { User, Phone } from "lucide-react";
import type { UserInfo } from "@/core/auth/authTypes";

interface StudentInfoCardProps {
  user: UserInfo | null;
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ user }) => {
  return (
    <section className="rounded-[16px] border border-surface-border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="flex items-center gap-3 pr-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Vai trò</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-text-heading">
              Học viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Liên hệ</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-text-heading">
              {user?.phoneNumber || "Chưa cập nhật"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentInfoCard;
