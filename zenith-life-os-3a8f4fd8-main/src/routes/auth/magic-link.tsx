import { createFileRoute } from '@tanstack/react-router';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/magic-link')({
  component: MagicLinkPage,
});

function MagicLinkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">الرابط السحري</h1>
          <p className="text-muted-foreground text-sm">سنرسل لك رابطاً للدخول الفوري</p>
        </div>
        <MagicLinkForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth/signin" className="text-accent hover:underline">العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
