import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../../lib/auth/supabase";
import { Globe, Clock, User, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

const STEPS = ["locale", "profile", "timezone", "done"] as const;
type Step = typeof STEPS[number];

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
});

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemax={total} aria-label={`الخطوة ${current} من ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? "bg-accent" : i === current ? "bg-accent w-8" : "bg-white/10 w-4"} ${i < current ? "w-4" : ""}`} />
      ))}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("locale");
  const [saving, setSaving] = useState(false);

  // Form state
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("Africa/Cairo");

  const currentIdx = STEPS.indexOf(step);

  const handleNext = async () => {
    const nextStep = STEPS[currentIdx + 1];

    // Persist step progress to onboarding_state after each step
    const { data: { user } } = await supabase.auth.getUser();

    if (nextStep === "done") {
      // Save to Supabase
      setSaving(true);

      if (user) {
        // 1. Update user metadata
        await supabase.auth.updateUser({
          data: { display_name: displayName, locale, timezone, onboarding_completed: true },
        });

        // 2. Update users table columns (via public.users extended in M0401)
        await supabase
          .from("users")
          .update({
            locale,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        // 3. ensurePersonalWorkspace — create if not exists (W01 contract)
        const { data: existingWs } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_id", user.id)
          .eq("is_personal", true)
          .maybeSingle();

        if (!existingWs) {
          await supabase.from("workspaces").insert({
            owner_id: user.id,
            name: displayName ? `مساحة ${displayName}` : "مساحتي الشخصية",
            is_personal: true,
            locale,
            timezone,
          });
        }

        // 4. Mark onboarding_state as completed
        await supabase.from("onboarding_state").upsert(
          {
            user_id: user.id,
            step: "done",
            payload: { locale, display_name: displayName, timezone },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }

      setSaving(false);
      setStep("done");
    } else {
      // Save intermediate step
      if (user) {
        await supabase.from("onboarding_state").upsert(
          {
            user_id: user.id,
            step: nextStep,
            payload: { locale, display_name: displayName, timezone },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
      setStep(nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = STEPS[currentIdx - 1];
    if (prevStep) setStep(prevStep);
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass rounded-2xl p-10 text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً {displayName ? `يا ${displayName}` : "بك"}!</h1>
          <p className="text-muted-foreground text-sm">تم إعداد حسابك. Zenith جاهز لمرافقتك كل يوم.</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ابدأ يومك مع Zenith
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <main id="onboarding-main" className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-grad-green text-2xl font-black">Z</span>
          <span className="text-2xl font-black text-foreground">enith</span>
          <p className="mt-1 text-sm text-muted-foreground">نخصّص تجربتك</p>
        </div>

        <StepIndicator current={currentIdx} total={STEPS.length - 1} />

        <div className="glass rounded-2xl p-8 space-y-6" role="region" aria-label={`خطوة الإعداد ${currentIdx + 1}`}>
          {/* Step: Locale */}
          {step === "locale" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">اختر اللغة</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["ar", "en"] as const).map((l) => (
                  <button key={l} onClick={() => setLocale(l)}
                    aria-pressed={locale === l}
                    className={`rounded-xl border p-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${locale === l ? "border-accent bg-accent/10 text-accent" : "border-border bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                    {l === "ar" ? "🇸🇦 العربية" : "🇬🇧 English"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">ما اسمك؟</h2>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ob-name" className="text-sm text-muted-foreground">الاسم المعروض</label>
                <input id="ob-name" type="text" autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: أحمد"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
                  maxLength={60} />
                <p className="text-xs text-muted-foreground">يظهر في لوحة التحكم فقط. يمكن تغييره لاحقاً.</p>
              </div>
            </div>
          )}

          {/* Step: Timezone */}
          {step === "timezone" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">منطقتك الزمنية</h2>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ob-tz" className="text-sm text-muted-foreground">المنطقة الزمنية</label>
                <select id="ob-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
                  dir="ltr">
                  {[
                    ["Africa/Cairo", "مصر — القاهرة (UTC+2/+3)"],
                    ["Asia/Riyadh", "السعودية — الرياض (UTC+3)"],
                    ["Asia/Dubai", "الإمارات — دبي (UTC+4)"],
                    ["Africa/Khartoum", "السودان — الخرطوم (UTC+3)"],
                    ["Africa/Tunis", "تونس — تونس (UTC+1)"],
                    ["Africa/Casablanca", "المغرب — الدار البيضاء (UTC+1)"],
                    ["Asia/Baghdad", "العراق — بغداد (UTC+3)"],
                    ["Asia/Amman", "الأردن — عمّان (UTC+2/+3)"],
                    ["Asia/Beirut", "لبنان — بيروت (UTC+2/+3)"],
                    ["Europe/London", "لندن (UTC+0/+1)"],
                    ["America/New_York", "نيويورك (UTC-5/-4)"],
                  ].map(([tz, label]) => (
                    <option key={tz} value={tz}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex ${currentIdx > 0 ? "justify-between" : "justify-end"}`}>
            {currentIdx > 0 && (
              <button onClick={handlePrev}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="الخطوة السابقة">
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                السابق
              </button>
            )}
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="الخطوة التالية" aria-busy={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> حفظ...</> : <>
                التالي <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </>}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          يمكنك تغيير هذه الإعدادات لاحقاً من الإعدادات
        </p>
      </main>
    </div>
  );
}
