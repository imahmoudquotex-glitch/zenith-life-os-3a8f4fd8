import { supabase } from "./supabase";

export type SignInResult =
  | { ok: true }
  | { ok: false; code: "INVALID_CREDENTIALS" | "RATE_LIMITED" | "UNKNOWN"; message: string };

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return { ok: true };
  if (error.status === 429) return { ok: false, code: "RATE_LIMITED", message: "كثير من المحاولات. حاول بعد قليل." };
  // Never reveal if user exists
  return { ok: false, code: "INVALID_CREDENTIALS", message: "البريد أو كلمة المرور غير صحيحة." };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<SignInResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (!error) return { ok: true };
  // Same message for existing / non-existing
  if (error.message?.toLowerCase().includes("already")) {
    return { ok: true }; // pretend success — email sent
  }
  return { ok: false, code: "UNKNOWN", message: "حدث خطأ. حاول مرة أخرى." };
}

export async function signInWithOAuth(
  provider: "google" | "github",
  redirectTo?: string,
) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
      scopes: provider === "github" ? "read:user user:email" : undefined,
      queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
    },
  });
}

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function resetPasswordRequest(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
  });
}

export async function resetPasswordConfirm(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function safeRedirectPath(input: string | null, fallback = "/today"): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  if (/[\r\n\\]/.test(input)) return fallback;
  if (input.length > 512) return fallback;
  return input;
}
