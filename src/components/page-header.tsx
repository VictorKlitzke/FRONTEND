import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  children?: ReactNode;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  iconColor = "var(--brand-gradient-main)",
  children,
}: PageHeaderProps) => {
  return (
    <div className="page-feature-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconColor, boxShadow: "0 4px 12px rgba(var(--brand-primary-rgb, 5, 150, 105), 0.28)" }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children && <div className="sm:shrink-0">{children}</div>}
    </div>
  );
};
