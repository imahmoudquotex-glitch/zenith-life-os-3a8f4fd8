/**
 * Dashboard Widget Hooks — Phase 06 (SSR-Safe)
 * 
 * استخدام useQuery بدلاً من useSuspenseQuery لأن:
 * - SSR في TanStack Start لا يدعم useSuspenseQuery مع useAuth
 * - enabled: !!user?.id يمنع الاستدعاء في SSR (user = null)
 * - isLoading state يُعرض skeleton تلقائياً
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../components/auth/AuthProvider";
import {
  getTasksServerFn,
  getHabitsServerFn,
  getExpensesServerFn,
  getNotesServerFn,
  getEnergyServerFn,
  getLifeScoreServerFn,
  getXpServerFn,
} from "./queries";

export function useTasksWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => getTasksServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: [],
  });
}

export function useHabitsWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["habits", user?.id],
    queryFn: () => getHabitsServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: [],
  });
}

export function useExpensesWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: () => getExpensesServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: { totalCents: 0, byCategory: [] },
  });
}

export function useNotesWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id],
    queryFn: () => getNotesServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: [],
  });
}

export function useEnergyWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["energy", user?.id],
    queryFn: () => getEnergyServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: [],
  });
}

export function useLifeScoreWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lifeScore", user?.id],
    queryFn: () => getLifeScoreServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: { score: 0, delta: 0 },
  });
}

export function useXpWidget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["xp", user?.id],
    queryFn: () => getXpServerFn({ data: user!.id }),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: { xp: 0, level: 1 },
  });
}
