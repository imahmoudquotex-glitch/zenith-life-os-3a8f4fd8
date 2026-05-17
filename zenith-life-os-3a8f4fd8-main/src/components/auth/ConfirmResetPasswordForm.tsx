import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';

function scorePassword(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0-4
}

const strengthLabel = ['ضعيفة جداً','ضعيفة','متوسطة','قوية','قوية جداً'];
const strengthColor = ['bg-red-600','bg-orange-500','bg-yellow-500','bg-green-500','bg-emerald-400'];

export function ConfirmResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const score = scorePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (score < 2) { setError('كلمة المرور ضعيفة جداً'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError('حدث خطأ. الرابط منتهٍ أو مُستخدَم.'); return; }
    setDone(true);
    setTimeout(() => navigate({ to: '/auth/signin' }), 2000);
  };

  if (done) return (
    <div className="text-center space-y-3">
      <div className="text-4xl">✅</div>
      <p className="text-foreground font-semibold">تم تغيير كلمة المرور!</p>
      <p className="text-muted-foreground text-sm">جارٍ تحويلك لتسجيل الدخول...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">كلمة المرور الجديدة</label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="bg-transparent border-border"
        />
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`flex-1 rounded-full transition-colors ${i < score ? strengthColor[score] : 'bg-border'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strengthLabel[score]}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">تأكيد كلمة المرور</label>
        <Input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="bg-transparent border-border"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'جارٍ الحفظ...' : 'تعيين كلمة المرور الجديدة'}
      </Button>
    </form>
  );
}
