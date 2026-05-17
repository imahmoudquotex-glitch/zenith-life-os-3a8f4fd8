import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, Save, Loader2, ChevronLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "../../components/auth/AuthProvider";
import { updateUserSettings, assertNoVaultContextPatch } from "../../lib/settings/settings-service";
import { SettingsNav } from "./profile";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({ meta: [{ title: "Zenith — الخصوصية" }] }),
  component: PrivacySettingsPage,
});

interface PrivacyState {
  analyticsOptOut: boolean;
  responseLanguage: "ar" | "en";
}

const DEFAULT_PRIVACY: PrivacyState = {
  analyticsOptOut: false,
  responseLanguage: "ar",
};

function PrivacySettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState<PrivacyState>(DEFAULT_PRIVACY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.settings) {
      const s = user.user_metadata.settings;
      setPrivacy({
        analyticsOptOut: s.privacy?.analyticsOptOut ?? false,
        responseLanguage: s.ai?.responseLanguage ?? "ar",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const patch = {
      privacy: { analyticsOptOut: privacy.analyticsOptOut },
      ai: { responseLanguage: privacy.responseLanguage },
      // 🔒 allowVaultContext مش مسموح هنا — يُجبر false من app + DB trigger
    };

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
            <h1 className="text-xl font-bold text-foreground">الخصوصية</h1>
            <p className="text-sm text-muted-foreground">تحكم في بياناتك وخصوصيتك</p>
          </div>
        </div>

        <SettingsNav active="privacy" />

        <form onSubmit={handleSave} className="space-y-6">
          {/* Analytics */}
          <section className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">بيانات الاستخدام</h2>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">إيقاف تتبع الاستخدام</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    نجمع بيانات مجهولة الهوية لتحسين التطبيق. يمكنك إيقاف هذا في أي وقت.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={privacy.analyticsOptOut}
                onClick={() => setPrivacy((p) => ({ ...p, analyticsOptOut: !p.analyticsOptOut }))}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  privacy.analyticsOptOut ? "bg-accent" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    privacy.analyticsOptOut ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* AI Language */}
          <section className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">إعدادات الذكاء الاصطناعي</h2>

            <div className="space-y-1.5">
              <label htmlFor="ai-lang" className="text-sm font-medium text-foreground">
                لغة الردود الذكية
              </label>
              <select
                id="ai-lang"
                value={privacy.responseLanguage}
                onChange={(e) =>
                  setPrivacy((p) => ({ ...p, responseLanguage: e.target.value as "ar" | "en" }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Vault Context - always locked */}
            <div className="flex items-start gap-3 rounded-xl bg-white/5 border border-border p-4">
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-red-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">محتوى الخزنة في سياق الذكاء الاصطناعي</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-400 font-semibold">مُقفل دائماً — </span>
                  محتوى خزنتك السرية لا يدخل في سياق الذكاء الاصطناعي أبداً. هذا إعداد نظام لا يمكن تغييره.
                </p>
              </div>
            </div>
          </section>

          {/* Vault Info */}
          <section className="glass rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-foreground">حماية بياناتك</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <EyeOff className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                بياناتك الشخصية لا تُشارك مع أي طرف ثالث
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                تشفير الخزنة يتم على جهازك (Zero-Knowledge)
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                ملاحظاتك في الداشبورد: عناوين فقط، لا محتوى
              </li>
            </ul>
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
