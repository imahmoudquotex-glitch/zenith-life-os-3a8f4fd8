import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Save, Loader2, ChevronLeft, Moon, Sun, Zap } from "lucide-react";
import { useAuth } from "../../components/auth/AuthProvider";
import { updateUserSettings, assertNoVaultContextPatch } from "../../lib/settings/settings-service";
import { SettingsNav } from "./profile";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({ meta: [{ title: "Zenith — الإشعارات" }] }),
  component: NotificationsSettingsPage,
});

interface NotifSettings {
  morningBriefAt: string;
  eveningReviewAt: string;
  enable: {
    morningBrief: boolean;
    eveningReview: boolean;
    taskReminder: boolean;
    habitReminder: boolean;
    focusSession: boolean;
  };
}

const DEFAULT_NOTIF: NotifSettings = {
  morningBriefAt: "07:00",
  eveningReviewAt: "21:00",
  enable: {
    morningBrief: true,
    eveningReview: true,
    taskReminder: true,
    habitReminder: true,
    focusSession: false,
  },
};

function NotificationsSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.settings?.notifications) {
      setNotif({
        ...DEFAULT_NOTIF,
        ...user.user_metadata.settings.notifications,
        enable: {
          ...DEFAULT_NOTIF.enable,
          ...(user.user_metadata.settings.notifications.enable ?? {}),
        },
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const patch = { notifications: notif };
    // ✅ Guard: لا vault context في الـ patch
    try {
      assertNoVaultContextPatch(patch);
    } catch {
      setError("خطأ في صلاحيات الإعدادات");
      setSaving(false);
      return;
    }

    const result = await updateUserSettings(user!.id, patch);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? "حدث خطأ في الحفظ");
    }
  };

  const toggleEnable = (key: keyof NotifSettings["enable"]) => {
    setNotif((prev) => ({
      ...prev,
      enable: { ...prev.enable, [key]: !prev.enable[key] },
    }));
  };

  const notifToggles: Array<{
    key: keyof NotifSettings["enable"];
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    { key: "morningBrief", label: "ملخص الصباح", desc: "ملخص يومك عند بداية اليوم", icon: Sun },
    { key: "eveningReview", label: "مراجعة المساء", desc: "مراجعة إنجازات اليوم مساءً", icon: Moon },
    { key: "taskReminder", label: "تذكيرات المهام", desc: "إشعارات عند اقتراب موعد مهمة", icon: Bell },
    { key: "habitReminder", label: "تذكيرات العادات", desc: "تذكير يومي لمتابعة عاداتك", icon: Zap },
    { key: "focusSession", label: "جلسات التركيز", desc: "إشعار عند دخول نافذة تركيز مثالية", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/settings" as "/" })}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="الرجوع"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">الإشعارات</h1>
            <p className="text-sm text-muted-foreground">تحكم في أوقات وأنواع الإشعارات</p>
          </div>
        </div>

        <SettingsNav active="notifications" />

        <form onSubmit={handleSave} className="space-y-6">
          {/* Timing */}
          <section className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">أوقات الإشعارات</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="morning-time" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                  ملخص الصباح
                </label>
                <input
                  id="morning-time"
                  type="time"
                  value={notif.morningBriefAt}
                  onChange={(e) => setNotif((p) => ({ ...p, morningBriefAt: e.target.value }))}
                  disabled={!notif.enable.morningBrief}
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all disabled:opacity-40"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="evening-time" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" aria-hidden="true" />
                  مراجعة المساء
                </label>
                <input
                  id="evening-time"
                  type="time"
                  value={notif.eveningReviewAt}
                  onChange={(e) => setNotif((p) => ({ ...p, eveningReviewAt: e.target.value }))}
                  disabled={!notif.enable.eveningReview}
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all disabled:opacity-40"
                  dir="ltr"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              ⚡ الحد الأقصى 5 إشعارات/ساعة لكل نوع لضمان عدم الإزعاج
            </p>
          </section>

          {/* Toggles */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">أنواع الإشعارات</h2>
            {notifToggles.map(({ key, label, desc, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notif.enable[key]}
                  onClick={() => toggleEnable(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    notif.enable[key] ? "bg-accent" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                      notif.enable[key] ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </section>

          {/* Error */}
          {error && (
            <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-busy={saving}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> جارٍ الحفظ...</>
              ) : (
                <><Save className="w-4 h-4" aria-hidden="true" /> حفظ التغييرات</>
              )}
            </button>
            {saved && <span className="text-sm text-accent animate-pulse">تم الحفظ ✓</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
