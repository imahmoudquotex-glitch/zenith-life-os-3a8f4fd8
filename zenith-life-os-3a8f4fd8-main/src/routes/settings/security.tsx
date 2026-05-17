import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../../lib/auth/supabase";
import { ChevronLeft, Loader2, Shield, Key, Fingerprint } from "lucide-react";
import { SettingsNav } from "./profile";

export const Route = createFileRoute("/settings/security")({
  component: SecuritySettingsPage,
});

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const strengthLabel = ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"];
const strengthColor = ["bg-red-600", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-400"];

function SecuritySettingsPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const score = scorePassword(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      setStatus("error");
      return;
    }
    if (score < 2) {
      setErrorMsg("كلمة المرور ضعيفة جداً");
      setStatus("error");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setStatus("idle");

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      setErrorMsg("فشل تغيير كلمة المرور. حاول مرة أخرى.");
      setStatus("error");
    } else {
      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/settings" as "/" })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" aria-label="الرجوع">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">الأمان</h1>
            <p className="text-sm text-muted-foreground">إدارة كلمة المرور والمصادقة الثنائية</p>
          </div>
        </div>

        <SettingsNav active="security" />

        {/* Password Change */}
        <form onSubmit={handleChangePassword} className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">تغيير كلمة المرور</h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sec-new" className="text-sm font-medium text-foreground">كلمة المرور الجديدة</label>
            <input id="sec-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              minLength={8} required autoComplete="new-password" dir="ltr"
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all" />
            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${i < score ? strengthColor[score] : "bg-border"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{strengthLabel[score]}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sec-confirm" className="text-sm font-medium text-foreground">تأكيد كلمة المرور</label>
            <input id="sec-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required autoComplete="new-password" dir="ltr"
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all" />
          </div>

          {status === "error" && (
            <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{errorMsg}</div>
          )}
          {status === "success" && (
            <div role="status" className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">تم تغيير كلمة المرور بنجاح ✓</div>
          )}

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent/90 disabled:opacity-50 transition-all"
            aria-busy={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</> : "تغيير كلمة المرور"}
          </button>
        </form>

        {/* 2FA Scaffold */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">المصادقة الثنائية (2FA)</h2>
          </div>
          <div className="rounded-xl border border-border bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">غير مفعّلة</p>
                <p className="text-xs text-muted-foreground">قريباً — المصادقة الثنائية عبر تطبيق المصادقة (TOTP) قيد التطوير.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
