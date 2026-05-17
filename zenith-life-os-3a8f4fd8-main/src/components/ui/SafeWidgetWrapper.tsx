import { Suspense, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { WidgetSkeleton } from "./WidgetShell";

interface SafeWidgetWrapperProps {
  title: string;
  children: ReactNode;
}

export function SafeWidgetWrapper({ title, children }: SafeWidgetWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-3xl bg-[rgba(239,68,68,0.02)] border border-red-500/20 p-6 shadow-xl h-full flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-3 text-red-400">
            !
          </div>
          <h2 className="text-sm font-bold text-red-400 mb-1">{title}</h2>
          <p className="text-xs text-red-400/70">تعذر تحميل هذه الواجهة مؤقتاً.</p>
        </div>
      }
    >
      <Suspense fallback={<WidgetSkeleton title={title} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
