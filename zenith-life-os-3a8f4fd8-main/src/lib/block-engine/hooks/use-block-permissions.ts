/**
 * Wave 06 — Block Permissions + Version History Hooks
 * src/lib/block-engine/hooks/use-block-permissions.ts
 */
import { useState, useCallback } from 'react';
import { supabase } from '../../auth/supabase';

interface BlockPermission {
  id: string;
  block_id: string;
  grantee_user_id?: string;
  grantee_role?: string;
  grantee?: string;
  level: 'view' | 'comment' | 'edit' | 'none';
  inherit_from_page: boolean;
  created_at: string;
}

interface BlockVersion {
  id: string;
  block_id: string;
  content_json: Record<string, unknown>;
  created_at: string;
  editor_name?: string;
}

// ─── useBlockPermissions ──────────────────────────────────────────────────────
export function useBlockPermissions(blockId: string) {
  const [data, setData] = useState<BlockPermission[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!blockId) return;
    setIsLoading(true);
    try {
      const { data: perms, error: err } = await supabase
        .from('block_permissions')
        .select('*')
        .eq('block_id', blockId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setData((perms ?? []).map((p) => ({
        ...p,
        grantee: p.grantee_user_id ?? p.grantee_role ?? '—',
      })));
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  // Auto-fetch on mount
  useState(() => { void fetch(); });

  return { data, isLoading, error, refetch: fetch };
}

// ─── useGrantBlockPermission ──────────────────────────────────────────────────
export function useGrantBlockPermission() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (
      input: { blockId: string; userId: string; level: string },
      options?: { onSuccess?: () => void; onError?: (e: Error) => void },
    ) => {
      setIsPending(true);
      try {
        const { error } = await supabase.from('block_permissions').upsert({
          block_id: input.blockId,
          grantee_user_id: input.userId,
          level: input.level,
          inherit_from_page: true,
          workspace_id: '', // filled by RLS
        });
        if (error) throw error;
        options?.onSuccess?.();
      } catch (e) {
        options?.onError?.(e as Error);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { mutate, isPending };
}

// ─── useBlockVersions ─────────────────────────────────────────────────────────
export function useBlockVersions(blockId: string, options: { limit?: number } = {}) {
  const [data, setData] = useState<BlockVersion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = options.limit ?? 50;

  const fetch = useCallback(async () => {
    if (!blockId) return;
    setIsLoading(true);
    try {
      const { data: versions, error } = await supabase
        .from('block_versions')
        .select('id, block_id, content_json, created_at')
        .eq('block_id', blockId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      setData(versions ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [blockId, limit]);

  useState(() => { void fetch(); });

  return { data, isLoading, refetch: fetch };
}
