import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { SafeWidgetWrapper } from "../components/ui/SafeWidgetWrapper";
import { useHabitsWidget } from "../lib/dashboard/hooks";

type Habit = { name: string; streak: number; level: number; done: boolean };

const initialFallback: Habit[] = [
  { name: "رياضة", streak: 31, level: 4, done: true },
  { name: "قراءة", streak: 12, level: 3, done: true },
  { name: "إنجليزي", streak: 5, level: 2, done: false },
  { name: "ماء", streak: 3, level: 1, done: false },
  { name: "نوم", streak: 1, level: 1, done: false },
];

function HabitsGardenContent() {
  const { data } = useHabitsWidget();
  // Ensure we have something to show
  const initialData = data && data.length > 0 ? data.map((h: { title?: string, name?: string, streak?: number, is_completed?: boolean }) => ({
    name: h.title || h.name || "عاده",
    streak: h.streak || 0,
    level: Math.min(4, Math.max(1, Math.floor((h.streak || 0) / 8) + 1)),
    done: h.is_completed || false
  })) : initialFallback;

  const [habits, setHabits] = useState<Habit[]>(initialData);
  const [burst, setBurst] = useState<string | null>(null);

  const toggle = (name: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.name !== name) return h;
        const done = !h.done;
        const streak = done ? h.streak + 1 : Math.max(0, h.streak - 1);
        const level = Math.min(4, Math.max(1, Math.floor(streak / 8) + 1));
        return { ...h, done, streak, level };
      }),
    );
    setBurst(name);
    setTimeout(() => setBurst(null), 700);
  };

  const total = habits.length;
  const doneCount = habits.filter((h) => h.done).length;
  const pct = (doneCount / total) * 100;

  return (
    <section className="glass rounded-3xl p-7 h-full relative overflow-hidden group">
      {/* Ambient garden glow */}
      <motion.div
        aria-hidden
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.18), transparent 70%)" }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Floating fireflies */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute w-1 h-1 rounded-full bg-[#4ADE80] pointer-events-none"
          style={{ left: `${10 + i * 14}%`, top: `${30 + (i % 3) * 18}%`, boxShadow: "0 0 8px #4ADE80" }}
          animate={{ y: [0, -14, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}

      <div className="flex items-baseline justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">حديقة العادات</h2>
          <motion.span
            animate={{ rotate: [0, 12, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-[#4ADE80]"
          >
            <Sparkles size={13} />
          </motion.span>
        </div>
        <div className="text-[11px] text-[#647067]">
          <span className="text-[#4ADE80] tabular font-bold">{doneCount}</span>/{total} اليوم · 52 يوم متصل
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 rounded-full bg-white/[0.05] mb-5 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full"
          style={{ background: "linear-gradient(90deg, #15803D, #4ADE80)", boxShadow: "0 0 12px rgba(74,222,128,0.6)" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", damping: 18, stiffness: 160 }}
        />
      </div>

      <div className="grid grid-cols-5 gap-3 relative z-10">
        {habits.map((h, i) => (
          <motion.div
            key={h.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, type: "spring", damping: 18 }}
            whileHover={{ y: -4 }}
            className="relative flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/[0.03] transition cursor-pointer border border-transparent hover:border-green-500/20"
            onClick={() => toggle(h.name)}
          >
            <div className="relative">
              <Plant level={h.level} sway />
              {/* Soil pulse on done */}
              <AnimatePresence>
                {burst === h.name && (
                  <>
                    {[0, 1, 2, 3, 4, 5].map((p) => (
                      <motion.span
                        key={p}
                        className="absolute left-1/2 top-3 w-1 h-1 rounded-full bg-[#4ADE80]"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos((p / 6) * Math.PI * 2) * 22,
                          y: Math.sin((p / 6) * Math.PI * 2) * 22 - 6,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ boxShadow: "0 0 6px #4ADE80" }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="text-[10px] text-[#A7B3AB] text-center">{h.name}</div>
            <motion.div
              key={h.streak}
              initial={{ scale: 1.4, color: "#4ADE80" }}
              animate={{ scale: 1 }}
              className="text-[11px] tabular font-bold text-[#4ADE80]"
            >
              {h.streak}ي
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); toggle(h.name); }}
              className={`relative w-6 h-6 rounded-full border flex items-center justify-center transition ${
                h.done
                  ? "bg-gradient-to-br from-[#15803D] to-[#4ADE80] border-green-400 shadow-[0_0_14px_rgba(74,222,128,0.6)]"
                  : "border-green-500/30 hover:bg-green-500/10 hover:border-green-500/60"
              }`}
            >
              <AnimatePresence>
                {h.done && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Plant({ level, sway }: { level: number; sway?: boolean }) {
  const heights = [16, 22, 30, 38, 46];
  const h = heights[Math.min(level - 1, 4)];
  const grad = useMemo(() => `p${level}-${Math.random().toString(36).slice(2, 7)}`, [level]);
  return (
    <motion.svg
      width="40" height="50" viewBox="0 0 40 50"
      animate={sway ? { rotate: [-2, 2, -2] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "20px 44px" }}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
      <path d="M12 44 L28 44 L26 50 L14 50 Z" fill="#1a1a1a" stroke="#647067" strokeWidth="0.5" />
      <line x1="20" y1="44" x2="20" y2={44 - h} stroke={`url(#${grad})`} strokeWidth="1.5" />
      {level >= 2 && <ellipse cx="15" cy={44 - h * 0.5} rx="5" ry="3" fill={`url(#${grad})`} transform={`rotate(-30 15 ${44 - h * 0.5})`} />}
      {level >= 2 && <ellipse cx="25" cy={44 - h * 0.5} rx="5" ry="3" fill={`url(#${grad})`} transform={`rotate(30 25 ${44 - h * 0.5})`} />}
      {level >= 3 && <circle cx="20" cy={44 - h} r="5" fill={`url(#${grad})`} />}
      {level >= 4 && <circle cx="26" cy={44 - h + 3} r="3" fill={`url(#${grad})`} />}
    </motion.svg>
  );
}

export default function HabitsGarden() {
  return (
    <SafeWidgetWrapper title="حديقة العادات">
      <HabitsGardenContent />
    </SafeWidgetWrapper>
  );
}