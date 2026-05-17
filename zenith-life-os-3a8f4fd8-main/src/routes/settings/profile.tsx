import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/auth/supabase";
import { useAuth } from "../../components/auth/AuthProvider";
import { User, Shield, Smartphone, AlertTriangle, Save, Loader2, ChevronLeft, Bell } from "lucide-react";

export const Route = createFileRoute("/settings/profile")({
  component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [timezone, setTimezone] = useState("Africa/Cairo");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      setDisplayName(user.user_metadata.display_name || "");
      setLocale(user.user_metadata.locale || "ar");
      setTimezone(user.user_metadata.timezone || "Africa/Cairo");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase.auth.updateUser({
      data: { display_name: displayName, locale, timezone },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/settings" as "/" })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" aria-label="الرجوع">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">الملف الشخصي</h1>
            <p className="text-sm text-muted-foreground">إدارة معلوماتك الشخصية</p>
          </div>
        </div>

        <SettingsNav active="profile" />

        <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-5">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-2xl">
              {displayName ? displayName[0] : user?.email?.[0]?.toUpperCase() || "Z"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">عضو منذ {user?.created_at ? new Date(user.created_at).toLocaleDateString("ar-EG") : "—"}</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label htmlFor="s-name" className="text-sm font-medium text-foreground">الاسم المعروض</label>
            <input id="s-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60} placeholder="أحمد"
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all" />
          </div>

          {/* Locale */}
          <div className="space-y-1.5">
            <label htmlFor="s-locale" className="text-sm font-medium text-foreground">اللغة</label>
            <select id="s-locale" value={locale} onChange={(e) => setLocale(e.target.value as "ar" | "en")}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label htmlFor="s-tz" className="text-sm font-medium text-foreground">المنطقة الزمنية</label>
            <select id="s-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all">
              {[
                ["Africa/Cairo", "مصر — القاهرة (UTC+2/+3)"],
                ["Asia/Riyadh", "السعودية — الرياض (UTC+3)"],
                ["Asia/Dubai", "الإمارات — دبي (UTC+4)"],
                ["Europe/London", "لندن (UTC+0/+1)"],
                ["America/New_York", "نيويورك (UTC-5/-4)"],
              ].map(([tz, label]) => <option key={tz} value={tz}>{label}</option>)}
            </select>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-busy={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> جارٍ الحفظ...</> : <><Save className="w-4 h-4" aria-hidden="true" /> حفظ التغييرات</>}
            </button>
            {saved && <span className="text-sm text-accent animate-pulse">تم الحفظ ✓</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

/** Settings Navigation Tabs — Phase 07 updated */
export function SettingsNav({ active }: { active: "profile" | "notifications" | "privacy" | "security" | "devices" | "danger" }) {
  const tabs = [
    { key: "profile", label: "الملف الشخصي", icon: User, href: "/settings/profile" },
    { key: "notifications", label: "الإشعارات", icon: Bell, href: "/settings/notifications" },
    { key: "privacy", label: "الخصوصية", icon: Shield, href: "/settings/privacy" },
    { key: "security", label: "الأمان", icon: Shield, href: "/settings/security" },
    { key: "devices", label: "الأجهزة", icon: Smartphone, href: "/settings/devices" },
    { key: "danger", label: "المنطقة الحمراء", icon: AlertTriangle, href: "/settings/danger" },
  ] as const;

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-border bg-white/5 p-1"
      aria-label="أقسام الإعدادات"
    >
      {tabs.map((tab) => (
        <a
          key={tab.key}
          href={tab.href}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            active === tab.key
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
          aria-current={active === tab.key ? "page" : undefined}
        >
          <tab.icon className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
