// packages/offline/src/conflict.ts
// Wave: W03 — Conflict resolution strategy per entity type

export type Strategy = 'last_write_wins' | 'server_wins' | 'client_wins' | 'show_conflict';
export type ConflictWinner = 'client' | 'server' | 'show';

/**
 * Get conflict resolution strategy for an entity type.
 * Rules per W03 plan §19.
 */
export function getStrategy(entityType: string): Strategy {
  switch (entityType) {
    case 'task':            return 'last_write_wins';
    case 'note':            return 'show_conflict';     // User must resolve manually (Wave 06 UI)
    case 'habit_checkin':   return 'server_wins';
    case 'expense':         return 'server_wins';       // Financial data — server authoritative
    case 'calendar_event':  return 'last_write_wins';
    case 'vault_item':      return 'server_wins';       // E2E encrypted — server authoritative
    case 'goal':            return 'last_write_wins';
    case 'workspace':       return 'server_wins';
    default:                return 'last_write_wins';
  }
}

/**
 * Resolve which version wins given strategy + version metadata.
 */
export function resolve(
  server: { version: number; updatedAt: string },
  client: { version: number; updatedAt: string },
  strategy: Strategy,
): ConflictWinner {
  if (strategy === 'server_wins') return 'server';
  if (strategy === 'client_wins') return 'client';
  if (strategy === 'show_conflict') {
    return server.version !== client.version ? 'show' : 'server';
  }
  // last_write_wins: compare versions then timestamps
  if (client.version > server.version) return 'client';
  if (client.version < server.version) return 'server';
  // Same version — compare timestamps
  return new Date(client.updatedAt) > new Date(server.updatedAt) ? 'client' : 'server';
}
