import { lazy, Suspense } from "react";
import { WidgetSkeleton } from "../components/ui/WidgetShell";

// Lazy load كل sections لتجنب SSR hydration errors مع framer-motion وuseSuspenseQuery
const HeroStatement = lazy(() => import("../sections/HeroStatement"));
const FocusLane = lazy(() => import("../sections/FocusLane"));
const PriorityMatrix = lazy(() => import("../sections/PriorityMatrix"));
const HabitsGarden = lazy(() => import("../sections/HabitsGarden"));
const MoneyFlow = lazy(() => import("../sections/MoneyFlow"));
const AIInsight = lazy(() => import("../sections/AIInsight"));
const DayTimeline = lazy(() => import("../sections/DayTimeline"));
const Interactive3DDeck = lazy(() => import("../sections/Interactive3DDeck"));

const WidgetFallback = () => <WidgetSkeleton title="جارٍ التحميل..." />;

export default function Dashboard() {
  return (
    <div className="space-y-12 pb-12">
      <Suspense fallback={<WidgetFallback />}>
        <HeroStatement />
      </Suspense>

      <Suspense fallback={<WidgetFallback />}>
        <FocusLane />
      </Suspense>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7 row-span-2">
          <Suspense fallback={<WidgetFallback />}>
            <PriorityMatrix />
          </Suspense>
        </div>
        <div className="col-span-12 md:col-span-5">
          <Suspense fallback={<WidgetFallback />}>
            <HabitsGarden />
          </Suspense>
        </div>
        <div className="col-span-12 md:col-span-5">
          <Suspense fallback={<WidgetFallback />}>
            <MoneyFlow />
          </Suspense>
        </div>
        <div className="col-span-12 md:col-span-7">
          <Suspense fallback={<WidgetFallback />}>
            <AIInsight />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense fallback={<WidgetFallback />}>
            <DayTimeline />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<WidgetFallback />}>
        <Interactive3DDeck />
      </Suspense>
    </div>
  );
}

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-[11px] uppercase tracking-[0.2em] text-[#647067] mb-3">قريباً</div>
      <h1 className="text-4xl font-extrabold text-grad-green mb-3">{title}</h1>
      <p className="text-[#A7B3AB] max-w-md">هذه الصفحة قيد التصميم. صفحة غرفة التحكم الرئيسية جاهزة.</p>
    </div>
  );
}