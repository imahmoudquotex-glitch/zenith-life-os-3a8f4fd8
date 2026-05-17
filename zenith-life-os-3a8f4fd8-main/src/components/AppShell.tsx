import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BackgroundFX from "./BackgroundFX";
import AIPanel, { AITrigger } from "./AIFloatingButton";

const SHELL_BYPASS_PREFIXES = ["/auth", "/onboarding"];

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [aiOpen, setAiOpen] = useState(false);
  const draggingSidebar = useRef(false);

  // Auth / onboarding pages render without the app shell chrome
  const isShellBypassed = SHELL_BYPASS_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAiOpen((v) => !v);
      }
      if (e.key === "Escape") setAiOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setAiOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!draggingSidebar.current) return;
      // Sidebar is visually on the LEFT. Width grows with mouse X.
      setSidebarWidth(Math.min(420, Math.max(72, e.clientX)));
    };
    const up = () => (draggingSidebar.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  if (isShellBypassed) {
    return (
      <div className="relative min-h-screen text-foreground">
        <BackgroundFX />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground">
      <BackgroundFX />
      <div className="relative z-10 flex flex-row-reverse min-h-screen">
        {/* Sidebar (visually left in RTL via flex-row-reverse) */}
        <Sidebar
          collapsed={collapsed}
          width={collapsed ? 72 : sidebarWidth}
          onToggle={() => setCollapsed((v) => !v)}
          onDragStart={() => (draggingSidebar.current = true)}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 px-8 pt-6">{children}</main>
        </div>

        {/* AI panel (visually right) — takes space when open */}
        <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>

      {/* Floating trigger bottom-right (visually) */}
      {!aiOpen && <AITrigger onClick={() => setAiOpen(true)} />}
    </div>
  );
}
