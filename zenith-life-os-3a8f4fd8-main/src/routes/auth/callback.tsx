import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/auth/supabase";
import { safeRedirectPath } from "../../lib/auth/actions";
import { Loader2, Copy, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fullUrl = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash;
    const errorParam = params.get("error");
    const errorDesc = params.get("error_description");
    const nextParam = params.get("next");
    const code = params.get("code");

    // Debug: show what we received
    const info = `URL: ${fullUrl}\nCode: ${code ? "YES (" + code.substring(0, 10) + "...)" : "NO"}\nHash: ${hashStr ? "YES" : "NO"}\nError: ${errorParam || "none"}\nErrorDesc: ${errorDesc || "none"}`;
    setDebugInfo(info);

    if (errorParam) {
      setHasError(true);
      return;
    }

    const handleCallback = async () => {
      try {
        if (code) {
          // PKCE flow: manually exchange the authorization code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setDebugInfo((prev) => prev + "\n\nExchange Error: " + exchangeError.message);
            setHasError(true);
            return;
          }
          if (data?.session) {
            const redirectTo = safeRedirectPath(nextParam, "/dashboard");
            navigate({ to: redirectTo as "/" });
            return;
          }
        }

        // If no code, maybe tokens are in hash (implicit flow fallback)
        if (hashStr && hashStr.length > 1) {
          const hashParams = new URLSearchParams(hashStr.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionError) {
              const redirectTo = safeRedirectPath(nextParam, "/dashboard");
              navigate({ to: redirectTo as "/" });
              return;
            }
            setDebugInfo((prev) => prev + "\n\nSetSession Error: " + sessionError.message);
          }
        }

        // Final fallback: check if session already exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const redirectTo = safeRedirectPath(nextParam, "/dashboard");
          navigate({ to: redirectTo as "/" });
          return;
        }

        setDebugInfo((prev) => prev + "\n\nNo code, no hash tokens, no existing session.");
        setHasError(true);
      } catch (err) {
        setDebugInfo((prev) => prev + "\n\nCatch Error: " + String(err));
        setHasError(true);
      }
    };

    handleCallback();
  }, [navigate]);

  const copyDebug = () => {
    navigator.clipboard.writeText(debugInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass backdrop-blur-3xl bg-black/40 rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6 max-w-md w-full mx-4 shadow-2xl shadow-black/50 border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <h2 className="text-2xl font-bold text-foreground">فشل تسجيل الدخول</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            حدث خطأ أثناء محاولة تسجيل الدخول عبر المزود. يُرجى نسخ تفاصيل الخطأ أدناه وإرسالها للدعم لمعرفة السبب.
          </p>
          
          {debugInfo && (
            <div className="relative group mt-4">
              <pre className="text-[11px] text-left text-red-300/80 bg-black/40 border border-red-500/10 rounded-2xl p-4 overflow-auto max-h-48 whitespace-pre-wrap font-mono" dir="ltr">
                {debugInfo}
              </pre>
              <button 
                onClick={copyDebug} 
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg p-1.5 transition-all shadow-lg backdrop-blur-md"
                aria-label="نسخ الخطأ"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          
          <div className="pt-4 border-t border-white/5">
            <a href="/auth/signin" className="inline-block rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 px-8 py-3 text-sm font-semibold text-foreground transition-all">
              العودة لتسجيل الدخول
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden" role="status" aria-live="polite" aria-label="جارٍ تسجيل الدخول...">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="text-center space-y-4 relative z-10">
        <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" aria-hidden="true" />
        <p className="text-muted-foreground text-sm font-medium tracking-wide">جارٍ تسجيل الدخول والتحقق...</p>
      </div>
    </div>
  );
}
