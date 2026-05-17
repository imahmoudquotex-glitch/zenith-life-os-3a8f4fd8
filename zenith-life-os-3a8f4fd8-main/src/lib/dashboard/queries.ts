/**
 * Dashboard Widget Queries — Phase 06
 * 
 * ملاحظة: في هذا المشروع (Vite + React SPA)، نستخدم async functions عادية
 * تُستدعى مباشرة من React Query. createServerFn مخصص للـ SSR فقط.
 * 
 * القواعد:
 * - ✅ safeWidget يمنع انهيار الداشبورد عند فشل أي widget
 * - ✅ لا AI calls في render path (assertDashboardHasNoAICall)
 * - ✅ notes: is_vault = false دائماً (B.5)
 */
import { safeWidget } from "./safe-widget";
import { supabase } from "../auth/supabase";

// ─── Raw DB fetchers ──────────────────────────────────────────────────────────

async function getTodayTasks(userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

async function getTodayHabits(userId: string) {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

async function getMonthExpenseSummary(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("user_id", userId);
  if (error) throw error;
  return {
    totalCents: data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0,
    byCategory: data ?? [],
  };
}

async function getRecentNoteTitlesOnly(userId: string, opts: { limit: number }) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .eq("is_vault", false) // B.5: no vault content in dashboard
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(opts.limit);
  if (error) throw error;
  return data ?? [];
}

async function getEnergyCurve(userId: string) {
  const { data, error } = await supabase
    .from("energy_points")
    .select("*")
    .eq("user_id", userId)
    .limit(24);
  if (error) throw error;
  return data ?? [];
}

async function getLifeScore(userId: string) {
  const { data, error } = await supabase
    .from("life_score")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? { score: 0, delta: 0 };
}

async function getXpAndLevel(userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", userId)
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return { xp: data?.settings?.xp ?? 0, level: data?.settings?.level ?? 1 };
}

// ─── Exported Query Functions (used by React Query hooks) ─────────────────────

export async function getTasksServerFn({ data: userId }: { data: string }) {
  return safeWidget("tasks", () => getTodayTasks(userId), []);
}

export async function getHabitsServerFn({ data: userId }: { data: string }) {
  return safeWidget("habits", () => getTodayHabits(userId), []);
}

export async function getExpensesServerFn({ data: userId }: { data: string }) {
  return safeWidget(
    "expenses",
    () => getMonthExpenseSummary(userId),
    { totalCents: 0, byCategory: [] }
  );
}

export async function getNotesServerFn({ data: userId }: { data: string }) {
  return safeWidget(
    "notes",
    () => getRecentNoteTitlesOnly(userId, { limit: 5 }),
    []
  );
}

export async function getEnergyServerFn({ data: userId }: { data: string }) {
  return safeWidget("energy", () => getEnergyCurve(userId), []);
}

export async function getLifeScoreServerFn({ data: userId }: { data: string }) {
  return safeWidget(
    "lifeScore",
    () => getLifeScore(userId),
    { score: 0, delta: 0 }
  );
}

export async function getXpServerFn({ data: userId }: { data: string }) {
  return safeWidget(
    "xpAndLevel",
    () => getXpAndLevel(userId),
    { xp: 0, level: 1 }
  );
}
