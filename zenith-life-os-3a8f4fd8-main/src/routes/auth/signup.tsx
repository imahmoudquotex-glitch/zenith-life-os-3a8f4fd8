import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "../../components/auth/SignUpForm";
import { CosmicBackground } from "../../components/ui/CosmicBackground";

export const Route = createFileRoute("/auth/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-black">
      <CosmicBackground />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 z-50 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background">
        انتقل للمحتوى الرئيسي
      </a>
      <main id="main-content" className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <span className="text-grad-green text-3xl font-black tracking-tight">Z</span>
          <span className="text-3xl font-black text-white tracking-tight">enith</span>
        </div>
        <SignUpForm />
      </main>
    </div>
  );
}
