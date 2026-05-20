// packages/offline/src/outbox.ts
// Wave: W03 — Enqueue, dequeue, and dead-letter management for offline mutations

import { getOfflineDB, type OutboxRow } from './db';

/**
 * Add a mutation to the offline outbox.
 * Call this instead of direct API call when offline or for optimistic updates.
 */
export async function enqueueMutation(
  row: Omit<OutboxRow, 'status' | 'attempts' | 'createdAt' | 'nextAttemptAt'>,
): Promise<void> {
  const db = await getOfflineDB();
  await db.put('outbox', {
    ...row,
    status: 'pending' as const,
    attempts: 0,
    createdAt: Date.now(),
    nextAttemptAt: Date.now(),
  });
}

/**
 * Get all pending mutations ready to sync (nextAttemptAt ≤ now, not dead).
 */
export async function getPendingMutations(): Promise<OutboxRow[]> {
  const db = await getOfflineDB();
  const tx = db.transaction('outbox', 'readonly');
  const idx = tx.objectStore('outbox').index('byNextAttempt');
  const now = Date.now();
  const result: OutboxRow[] = [];
  let cursor = await idx.openCursor();
  while (cursor) {
    const row = cursor.value as OutboxRow;
    if (row.status !== 'dead' && row.nextAttemptAt <= now) {
      result.push(row);
    }
    cursor = await cursor.continue();
  }
  return result;
}

/**
 * Get all dead-letter mutations (for dead-letter UI in /settings/sync).
 */
export async function getDeadLetters(): Promise<OutboxRow[]> {
  const db = await getOfflineDB();
  const tx = db.transaction('outbox', 'readonly');
  const idx = tx.objectStore('outbox').index('byStatus');
  const result = await idx.getAll('dead');
  return result as OutboxRow[];
}

/**
 * Mark a mutation as successfully synced — remove from outbox.
 */
export async function markSynced(id: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('outbox', id);
}

/**
 * Mark a mutation as failed — update attempts + nextAttemptAt.
 */
export async function markFailed(
  id: string,
  error: string,
  nextAttemptAt: number,
  dead: boolean,
): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');
  const row = (await store.get(id)) as OutboxRow | undefined;
  if (row) {
    await store.put({
      ...row,
      status: dead ? ('dead' as const) : ('failed' as const),
      attempts: row.attempts + 1,
      lastError: error,
      nextAttemptAt,
    });
  }
  await tx.done;
}

/**
 * Dismiss a dead-letter mutation (user action in /settings/sync).
 */
export async function dismissDeadLetter(id: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('outbox', id);
}

/**
 * Count of pending + failed mutations (for badge count).
 */
export async function getOutboxCount(): Promise<{ pending: number; dead: number }> {
  const db = await getOfflineDB();
  const tx = db.transaction('outbox', 'readonly');
  const idx = tx.objectStore('outbox').index('byStatus');
  const [pending, failed, syncing, dead] = await Promise.all([
    idx.count('pending'),
    idx.count('failed'),
    idx.count('syncing'),
    idx.count('dead'),
  ]);
  return { pending: pending + failed + syncing, dead };
}
