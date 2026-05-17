import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/auth/supabase';

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => navigate({ to: '/dashboard' }), 2000);
      } else {
        setStatus('error');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 text-center space-y-4">
        {status === 'checking' && (
          <>
            <div className="text-4xl animate-pulse">🔍</div>
            <p className="text-foreground font-semibold">جارٍ التحقق...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl">✅</div>
            <p className="text-foreground font-semibold">تم تفعيل البريد الإلكتروني!</p>
            <p className="text-muted-foreground text-sm">جارٍ تحويلك للوحة التحكم...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <p className="text-foreground font-semibold">الرابط منتهٍ أو مُستخدَم</p>
            <p className="text-muted-foreground text-sm">طلب رابطاً جديداً من صفحة تسجيل الدخول</p>
          </>
        )}
      </div>
    </div>
  );
}
