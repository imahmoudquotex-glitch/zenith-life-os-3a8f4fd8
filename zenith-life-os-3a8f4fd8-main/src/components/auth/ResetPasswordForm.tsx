import { useState } from "react";
import { resetPasswordRequest } from "../../lib/auth/actions";
import { Mail, Loader2, CheckCircle, ArrowRight } from "lucide-react";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Always show success regardless — never reveal if email exists
    await resetPasswordRequest(email);
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="glass backdrop-blur-3xl bg-black/40 rounded-[2.5rem] p-10 text-center space-y-6 w-full max-w-md shadow-2xl shadow-black/50 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]">
          <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">تفقّد بريدك الإلكتروني</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين خلال دقيقة.
          </p>
          <p className="text-xs text-muted-foreground mt-4">الرابط صالح لـ 60 دقيقة. لا تشارك الرابط مع أحد.</p>
        </div>
        <div className="pt-6 border-t border-white/5">
          <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 px-6 py-2.5 text-sm font-medium text-foreground transition-all group">
            <ArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass backdrop-blur-3xl bg-black/40 rounded-[2.5rem] p-8 sm:p-12 space-y-8 w-full max-w-md shadow-2xl shadow-black/50 border border-white/[0.08] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="space-y-3 text-center relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent pb-1">إعادة تعيين كلمة المرور</h1>
        <p className="text-muted-foreground text-sm font-medium">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
        <div className="space-y-2.5">
          <label htmlFor="reset-email" className="block text-sm font-medium text-foreground/80">
            البريد الإلكتروني
          </label>
          <div className="relative flex items-center bg-black/20 border border-white/10 rounded-2xl overflow-hidden focus-within:border-accent/50 focus-within:bg-accent/5 focus-within:ring-1 focus-within:ring-accent/50 transition-all group" dir="ltr">
            <div className="pl-4 pr-3 flex items-center justify-center pointer-events-none">
              <Mail className="w-5 h-5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
            </div>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent py-3.5 pr-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
            />
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "submitting" || !email}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground text-background px-4 py-4 text-sm font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {status === "submitting" ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الإرسال...</> : "إرسال رابط الاستعادة"}
          </button>
        </div>
        <div className="pt-6 border-t border-white/5 text-center">
          <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </a>
        </div>
      </form>
    </div>
  );
}
