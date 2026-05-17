import { createFileRoute } from '@tanstack/react-router';
import { ConfirmResetPasswordForm } from '@/components/auth/ConfirmResetPasswordForm';

export const Route = createFileRoute('/auth/reset-password/confirm')({
  component: ConfirmResetPasswordPage,
});

function ConfirmResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
          <p className="text-muted-foreground text-sm">اختر كلمة مرور قوية</p>
        </div>
        <ConfirmResetPasswordForm />
      </div>
    </div>
  );
}
