export type Strategy = 'last_write_wins' | 'server_wins' | 'client_wins' | 'show_conflict';

export function getStrategy(entityType: string): Strategy {
  switch (entityType) {
    case 'task':          return 'last_write_wins';
    case 'note':          return 'show_conflict';
    case 'habit_checkin': return 'server_wins';
    case 'expense':       return 'server_wins';
    case 'calendar_event':return 'last_write_wins';
    case 'vault_item':    return 'server_wins';
    default:              return 'last_write_wins';
  }
}

export function resolve(
  server: { version: number; updatedAt: string },
  client: { version: number; updatedAt: string },
  strategy: Strategy,
): 'client' | 'server' | 'show' {
  if (strategy === 'server_wins') return 'server';
  if (strategy === 'client_wins') return 'client';
  if (strategy === 'show_conflict') {
    return server.version !== client.version ? 'show' : 'server';
  }
  // last_write_wins
  if (client.version > server.version) return 'client';
  if (client.version < server.version) return 'server';
  return new Date(client.updatedAt) > new Date(server.updatedAt) ? 'client' : 'server';
}
