import React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export interface QuickAccessItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const QuickAccessItem: React.FC<QuickAccessItemProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[16px] border border-surface-border bg-white p-4 text-left shadow-sm transition-colors duration-150 hover:bg-surface-hover active:bg-gray-100"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-light text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-heading">{title}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
    </button>
  );
};

export default QuickAccessItem;
