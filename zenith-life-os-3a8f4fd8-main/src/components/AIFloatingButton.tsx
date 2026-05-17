import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity as InfinityIcon, X, Mic, Send, Paperclip, GripVertical } from "lucide-react";

export function AITrigger({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center group"
      style={{
        background: "radial-gradient(circle at 30% 30%, #1a2e22, #030504 70%)",
        border: "1.5px solid rgba(74,222,128,0.55)",
        boxShadow:
          "0 0 40px rgba(34,197,94,0.45), 0 0 80px rgba(34,197,94,0.18), inset 0 0 16px rgba(74,222,128,0.15)",
      }}
    >
      {/* Pulsing halo */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(74,222,128,0.4)" }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1.5 rounded-full border border-dashed border-green-500/40"
      />
      <motion.span
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-3 rounded-full border border-dotted border-green-400/25"
      />
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <InfinityIcon size={26} className="text-[#4ADE80] drop-shadow-[0_0_8px_rgba(74,222,128,0.9)]" strokeWidth={2.4} />
      </motion.div>
      <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap text-[11px] text-[#A7B3AB] opacity-0 group-hover:opacity-100 transition">
        زينيث AI · ⌘J
      </span>
    </motion.button>
  );
}

function StarField() {
  // generate once
  const stars = useRef(
    Array.from({ length: 60 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6,
      delay: Math.random() * 6,
      dur: 2 + Math.random() * 4,
    })),
  ).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#4ADE80]"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 4}px rgba(74,222,128,0.9)`,
          }}
          animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
      {/* Shooting stars */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={`shoot-${i}`}
          className="absolute h-px w-24"
          style={{
            top: `${15 + i * 25}%`,
            background: "linear-gradient(90deg, transparent, #4ADE80, transparent)",
          }}
          initial={{ x: "-20%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 3 + i * 2.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function AIPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [width, setWidth] = useState(440);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      // Panel is on the visual right (DOM left in flex-row-reverse). Width grows as mouse moves left.
      const w = window.innerWidth - e.clientX;
      setWidth(Math.min(720, Math.max(340, w)));
    };
    const up = () => { dragging.current = false; setIsDragging(false); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="ai-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="relative shrink-0 h-screen sticky top-0 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(34,197,94,0.10), transparent 60%), #020403",
          }}
        >
          {/* Glowing divider on the inner (left) edge — soft & calm */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px z-20"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.35) 30%, rgba(74,222,128,0.45) 50%, rgba(74,222,128,0.35) 70%, transparent 100%)",
              boxShadow: "0 0 6px rgba(74,222,128,0.25), 0 0 14px rgba(34,197,94,0.15)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute left-0 w-px z-20"
            style={{ background: "linear-gradient(180deg, transparent, rgba(74,222,128,0.55), transparent)" }}
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Drag handle (visually on the LEFT edge of the panel which is the inner side) */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              let moved = false;
              const mv = (ev: MouseEvent) => {
                if (Math.abs(ev.clientX - startX) > 3 && !moved) {
                  moved = true;
                  dragging.current = true;
                  setIsDragging(true);
                }
              };
              const up = () => {
                if (!moved) onClose();
                dragging.current = false;
                setIsDragging(false);
                window.removeEventListener("mousemove", mv);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", mv);
              window.addEventListener("mouseup", up);
            }}
            className="absolute top-0 left-0 h-full w-2 cursor-ew-resize z-30 group flex items-center justify-center"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-green-500/15 group-hover:bg-green-400/70 transition-all" />
            <motion.div
              animate={{ opacity: isDragging ? 1 : 0, scale: isDragging ? 1 : 0.85 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-5 h-10 rounded-md flex items-center justify-center bg-[#0b1410] border border-green-400/40 shadow-[0_0_18px_rgba(74,222,128,0.5)]"
            >
              <GripVertical size={12} className="text-[#4ADE80]" />
            </motion.div>
            {/* Cursor-style hint tooltip */}
            <div className="absolute top-1/2 -translate-y-1/2 left-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-2.5 py-1.5 rounded-md bg-[#1a1a1a]/95 border border-white/10 shadow-2xl text-[11px] text-white whitespace-nowrap leading-tight">
                <div><span className="font-semibold">Close</span> <span className="text-[#999]">Click or Ctrl+\</span></div>
                <div><span className="font-semibold">Resize</span> <span className="text-[#999]">Drag</span></div>
              </div>
            </div>
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-6 px-2 py-1 rounded-md bg-black/80 border border-green-400/40 text-[10px] text-[#4ADE80] tabular whitespace-nowrap"
                >
                  {Math.round(width)}px
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <StarField />

          <div style={{ width }} className="relative z-10 h-full flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ boxShadow: ["0 0 16px rgba(34,197,94,0.4)", "0 0 28px rgba(34,197,94,0.7)", "0 0 16px rgba(34,197,94,0.4)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #15803D, #4ADE80)",
                  }}
                >
                  <InfinityIcon size={18} strokeWidth={2.6} />
                </motion.div>
                <div>
                  <div className="text-sm font-bold tracking-wide">زينيث AI</div>
                  <div className="text-[10px] text-[#647067] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    متصل الآن
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
                <X size={15} />
              </button>
            </div>

            <div className="text-[11px] text-[#647067] border-b border-green-500/10 pb-3">
              يعرف مهامك، عاداتك، مصاريفك، وأهدافك
            </div>

            {/* Centered chat area */}
            <div className="flex-1 overflow-auto space-y-3 pr-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center"
              >
                <div className="text-[22px] font-bold text-grad-green mb-2">كيف أقدر أساعدك؟</div>
                <div className="text-[11px] text-[#647067]">اسأل عن أي شيء في يومك</div>
              </motion.div>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {["رتب يومي", "أضف مهمة", "حلل إنتاجيتي", "اقترح عادة"].map((q, i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-white/[0.04] border border-green-500/15 hover:border-green-400/60 hover:text-[#4ADE80] transition"
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Luxurious bottom input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative"
            >
              <div
                className="absolute -inset-px rounded-3xl opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(74,222,128,0.6), rgba(34,197,94,0.1), rgba(74,222,128,0.6))",
                  filter: "blur(8px)",
                }}
              />
              <div
                className="relative flex items-center gap-2 p-2.5 rounded-3xl"
                style={{
                  background: "rgba(8,14,10,0.95)",
                  border: "1px solid rgba(74,222,128,0.35)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <button className="w-10 h-10 rounded-2xl hover:bg-white/5 flex items-center justify-center text-[#A7B3AB]">
                  <Paperclip size={16} />
                </button>
                <input
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#647067] px-1"
                  placeholder="اسأل زينيث..."
                />
                <button className="w-10 h-10 rounded-2xl hover:bg-white/5 flex items-center justify-center text-[#A7B3AB]">
                  <Mic size={16} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.08, rotate: -8 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#15803D] to-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.55)]"
                >
                  <Send size={15} />
                </motion.button>
              </div>
              <div className="text-[10px] text-[#647067] mt-2 text-center tracking-wider">
                2 / 3 رسائل اليوم · مدعوم بـ زينيث AI
              </div>
            </motion.div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// Bubble component reserved for future chat history
export type _Bubble = ReactNode;