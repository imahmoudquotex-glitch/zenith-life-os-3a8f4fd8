import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError('حدث خطأ. حاول مرة أخرى.'); return; }
    setSent(true);
  };

  if (sent) return (
    <div className="text-center space-y-3">
      <div className="text-4xl">📬</div>
      <p className="text-foreground font-semibold">تحقق من بريدك الإلكتروني</p>
      <p className="text-muted-foreground text-sm">أرسلنا رابطاً سحرياً إلى <strong>{email}</strong></p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">البريد الإلكتروني</label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="bg-transparent border-border"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'جارٍ الإرسال...' : 'إرسال الرابط السحري'}
      </Button>
    </form>
  );
}
