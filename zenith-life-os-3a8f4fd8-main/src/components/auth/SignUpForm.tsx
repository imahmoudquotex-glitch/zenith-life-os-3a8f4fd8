import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signUpWithEmail, signInWithOAuth } from "../../lib/auth/actions";
import { Github, Loader2, CheckCircle, Mail, User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "12 حرفاً على الأقل", ok: password.length >= 12 },
    { label: "حرف كبير", ok: /[A-Z]/.test(password) },
    { label: "حرف صغير", ok: /[a-z]/.test(password) },
    { label: "رقم", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-accent"];

  if (!password) return null;
  return (
    <div className="space-y-2 mt-3" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score - 1] : "bg-white/10"}`} />
        ))}
      </div>
      <p className="text-xs font-medium text-muted-foreground flex justify-between items-center">
        <span>قوة كلمة المرور</span>
        <span className={score >= 4 ? "text-accent" : "text-muted-foreground"}>{levels[score - 1] ?? "ضعيفة جداً"}</span>
      </p>
    </div>
  );
}

export function SignUpForm() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (password !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (password.length < 12) {
      setErrorMsg("كلمة المرور قصيرة جداً (12 حرفاً على الأقل).");
      return;
    }
    if (!agreed) {
      setErrorMsg("يجب الموافقة على شروط الاستخدام.");
      return;
    }
    setStatus("submitting");
    const result = await signUpWithEmail(email, password, displayName);
    if (result.ok) {
      setEmailSent(true);
      setStatus("idle");
    } else {
      setErrorMsg(result.message);
      setStatus("error");
    }
  };

  if (emailSent) {
    return (
      <div className="glass backdrop-blur-3xl bg-black/40 rounded-[2.5rem] p-10 text-center space-y-6 w-full max-w-md shadow-2xl shadow-black/50 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]">
          <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">تحقّق من بريدك الإلكتروني</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            أرسلنا رابط التحقق إلى <br />
            <span className="text-foreground font-mono mt-2 inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg" dir="ltr">{email}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-4">الرابط صالح لـ 24 ساعة. بعد التحقق ستُحوَّل لإعداد حسابك.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-strong rounded-[2.5rem] p-8 sm:p-12 space-y-8 w-full max-w-md shadow-2xl shadow-black/80 border border-white/[0.08] relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="space-y-3 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent pb-1"
        >
          إنشاء حساب
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-sm font-medium"
        >
          ابدأ مجاناً. لا توجد بطاقة ائتمانية مطلوبة.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex gap-3 relative z-10"
      >
        <button type="button" onClick={() => signInWithOAuth("google")}
          className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 px-4 py-3.5 text-sm font-medium text-foreground transition-all focus-visible:outline-none focus-visible:border-white/30 focus-visible:bg-white/[0.05] group"
        >
          <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-semibold tracking-wide">جوجل</span>
        </button>
        <button type="button" onClick={() => signInWithOAuth("github")}
          className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 px-4 py-3.5 text-sm font-medium text-foreground transition-all focus-visible:outline-none focus-visible:border-white/30 focus-visible:bg-white/[0.05] group"
        >
          <Github className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
          <span className="font-semibold tracking-wide">جيت هب</span>
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative flex items-center gap-4 z-10"
      >
        <div className="flex-1 border-t border-white/5" />
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">أو عبر البريد</span>
        <div className="flex-1 border-t border-white/5" />
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onSubmit={handleSubmit} 
        className="space-y-5 relative z-10" 
        autoComplete="off"
        noValidate
      >
        {/* Anti-autofill dummy fields */}
        <input type="email" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />
        <div className="space-y-2">
          <label htmlFor="signup-name" className="block text-sm font-medium text-foreground/80 mb-1.5">
            الاسم الكامل
          </label>
          <div className="relative flex items-center border-b border-white/20 focus-within:border-white transition-colors duration-300 group pb-1">
            <div className="pr-3 pl-3 flex items-center justify-center pointer-events-none">
              <User className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-white transition-colors" />
            </div>
            <input id="signup-name" type="text" name="name" autoComplete="off" data-lpignore="true" required value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full bg-transparent py-2 pl-3 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-email" className="block text-sm font-medium text-foreground/80 mb-1.5">
            البريد الإلكتروني
          </label>
          <div className="relative flex items-center border-b border-white/20 focus-within:border-white transition-colors duration-300 group pb-1" dir="ltr">
            <div className="pr-3 flex items-center justify-center pointer-events-none">
              <Mail className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-white transition-colors" />
            </div>
            <input id="signup-email" type="email" name="email" autoComplete="off" data-lpignore="true" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-transparent py-2 pr-2 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-password" className="block text-sm font-medium text-foreground/80 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative flex items-center border-b border-white/20 focus-within:border-white transition-colors duration-300 group pb-1" dir="ltr">
            <div className="pr-3 flex items-center justify-center pointer-events-none">
              <Lock className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-white transition-colors" />
            </div>
            <input id="signup-password" type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" data-lpignore="true"
              required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent py-2 pr-2 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="pr-2 pl-3 flex items-center text-muted-foreground/50 hover:text-white transition-colors focus:outline-none">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground/80 mb-1.5">
            تأكيد كلمة المرور
          </label>
          <div className="relative flex items-center border-b border-white/20 focus-within:border-white transition-colors duration-300 group pb-1" dir="ltr">
            <div className="pr-3 flex items-center justify-center pointer-events-none">
              <Lock className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-white transition-colors" />
            </div>
            <input id="signup-confirm" type="password" name="confirmPassword" autoComplete="new-password" data-lpignore="true" required
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent py-2 pr-2 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input id="signup-agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 accent-foreground focus-visible:outline-none focus-visible:border-white/30 cursor-pointer transition-all"
            aria-required="true" />
          <label htmlFor="signup-agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer select-none">
            أوافق على <a href="/terms" className="text-foreground hover:text-white transition-colors font-medium underline underline-offset-2 decoration-white/20">شروط الاستخدام</a> و <a href="/privacy" className="text-foreground hover:text-white transition-colors font-medium underline underline-offset-2 decoration-white/20">سياسة الخصوصية</a>
          </label>
        </div>

        {status === "error" && (
          <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {errorMsg}
          </div>
        )}

        <div className="pt-2">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" disabled={status === "submitting" || !email || !password || !displayName}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-4 text-sm font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:border-white/30"
          >
            {status === "submitting" ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الإنشاء...</> : "إنشاء الحساب"}
          </motion.button>
        </div>
      </motion.form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="pt-6 border-t border-white/5 text-center relative z-10"
      >
        <p className="text-sm text-muted-foreground mb-4">لديك حساب بالفعل؟</p>
        <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 px-6 py-2.5 text-sm font-medium text-foreground transition-all group">
          تسجيل الدخول
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </motion.div>
  );
}

