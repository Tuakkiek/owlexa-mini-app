import React from "react";
import { CalendarDays, CircleCheck, ClipboardList, FileText } from "lucide-react";
import { useNavigate } from "zmp-ui";
import { PATHS } from "@/router/routes";
import { QuickAccessItem } from "./QuickAccessItem";

export const QuickAccessSection: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: "Xem lịch học",
      description: "Theo dõi ca học trong tuần",
      icon: CalendarDays,
      path: PATHS.SCHEDULE,
    },
    {
      title: "Xem điểm danh",
      description: "Kiểm tra trạng thái có mặt theo lớp",
      icon: CircleCheck,
      path: PATHS.ATTENDANCE,
    },
    {
      title: "Bài tập của tôi",
      description: "Theo dõi bài được giao và deadline",
      icon: ClipboardList,
      path: PATHS.ASSIGNMENTS,
    },
    {
      title: "Tài liệu học tập",
      description: "Mở PDF, video và tài liệu lớp học",
      icon: FileText,
      path: PATHS.DOCUMENTS,
    },
  ];

  return (
    <section>
      <div>
        <h2 className="text-base font-bold text-text-heading">Truy cập nhanh</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Các tính năng học tập thường dùng
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <QuickAccessItem
            key={item.path}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </section>
  );
};

export default QuickAccessSection;
