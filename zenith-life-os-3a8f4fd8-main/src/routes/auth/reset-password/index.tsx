import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "../../../components/auth/ResetPasswordForm";

export const Route = createFileRoute("/auth/reset-password/")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <main id="main-content" className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-grad-green text-3xl font-black tracking-tight">Z</span>
          <span className="text-3xl font-black text-foreground tracking-tight">enith</span>
        </div>
        <ResetPasswordForm />
      </main>
    </div>
  );
}
