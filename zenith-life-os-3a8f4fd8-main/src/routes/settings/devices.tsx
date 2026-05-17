import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Smartphone, Monitor, Tablet, Clock } from "lucide-react";
import { SettingsNav } from "./profile";

export const Route = createFileRoute("/settings/devices")({
  component: DevicesSettingsPage,
});

function DevicesSettingsPage() {
  const navigate = useNavigate();

  // Placeholder device data — will connect to W03 device_registry
  const devices = [
    {
      id: "current",
      name: "هذا الجهاز",
      type: "desktop" as const,
      browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "متصفح آخر",
      lastUsed: new Date().toISOString(),
      isCurrent: true,
    },
  ];

  const deviceIcon = (type: string) => {
    if (type === "mobile") return Smartphone;
    if (type === "tablet") return Tablet;
    return Monitor;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/settings" as "/" })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" aria-label="الرجوع">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">الأجهزة المتصلة</h1>
            <p className="text-sm text-muted-foreground">إدارة جلسات تسجيل الدخول النشطة</p>
          </div>
        </div>

        <SettingsNav active="devices" />

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">الجلسات النشطة</h2>
            <button className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              إنهاء كل الجلسات الأخرى
            </button>
          </div>

          <div className="space-y-3">
            {devices.map((device) => {
              const Icon = deviceIcon(device.type);
              return (
                <div key={device.id} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${device.isCurrent ? "border-accent/30 bg-accent/5" : "border-border bg-white/5"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${device.isCurrent ? "bg-accent/10" : "bg-white/10"}`}>
                      <Icon className={`w-5 h-5 ${device.isCurrent ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{device.name}</p>
                        {device.isCurrent && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">الحالي</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{device.browser}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>{new Date(device.lastUsed).toLocaleDateString("ar-EG")}</span>
                    </div>
                    {!device.isCurrent && (
                      <button className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
                        إنهاء
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            قريباً — ربط فعلي بجدول device_registry من Wave 03. الآن يُعرض الجهاز الحالي فقط.
          </p>
        </div>
      </div>
    </div>
  );
}
