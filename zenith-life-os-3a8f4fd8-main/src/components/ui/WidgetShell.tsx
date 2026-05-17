import { ReactNode } from "react";

interface WidgetShellProps {
  title: string;
  count?: number;
  href?: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: ReactNode;
}

export function WidgetShell({
  title,
  count,
  href,
  isEmpty,
  emptyLabel = "لا يوجد شيء الآن",
  children,
}: WidgetShellProps) {
  return (
    <div className="rounded-3xl bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-[rgba(255,255,255,0.05)] p-6 shadow-xl relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-[#F4F7F5]">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-[#A7B3AB] bg-black/20 rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
        {href && (
          <a href={href} className="text-xs text-[#4ADE80] hover:underline">
            الكل
          </a>
        )}
      </div>
      {isEmpty ? (
        <p className="text-sm text-[#A7B3AB] text-center py-6">{emptyLabel}</p>
      ) : (
        children
      )}
    </div>
  );
}

export function WidgetSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-3xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6 animate-pulse h-full">
      <div className="h-4 w-24 bg-white/10 rounded mb-5" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-white/5 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
