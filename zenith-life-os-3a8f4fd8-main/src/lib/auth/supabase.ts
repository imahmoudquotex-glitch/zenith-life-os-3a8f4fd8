// @zenith/shared — Supabase Browser Client
// Reviewer issue #15, #38: persistSession MUST be false.
// Auth tokens live in httpOnly cookies, NOT localStorage.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // SECURITY: persistSession=false → no localStorage tokens
    // Session managed via httpOnly cookies on server-side
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

export type AuthUser = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
