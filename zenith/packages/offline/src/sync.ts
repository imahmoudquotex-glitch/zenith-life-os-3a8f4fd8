import { getOfflineDB, type OutboxRow } from './db';
import { calcNextAttempt } from './backoff';
import { type Clock, systemClock } from '@zenith/shared/time';

const MAX_ATTEMPTS = 8;

function readCsrfCookie(): string {
  const match = document.cookie.match(/(?:^|; )__csrf=([^;]+)/);
  return match?.[1] !== undefined ? decodeURIComponent(match[1]) : '';
}

export async function enqueueMutation(
  row: Omit<OutboxRow, 'status' | 'attempts' | 'createdAt' | 'nextAttemptAt'>,
  clock: Clock = systemClock,
): Promise<void> {
  const db = await getOfflineDB();
  const now = clock.nowMs();
  await db.put('outbox', {
    ...row,
    status: 'pending',
    attempts: 0,
    createdAt: now,
    nextAttemptAt: now,
  });
}

export async function processSyncQueue(
  fetchFn: typeof fetch = fetch,
  clock: Clock = systemClock,
): Promise<{ ok: number; failed: number; dead: number }> {
  const db = await getOfflineDB();
  const stats = { ok: 0, failed: 0, dead: 0 };
  const tx = db.transaction('outbox', 'readwrite');
  const idx = tx.objectStore('outbox').index('byNextAttempt');
  const now = clock.nowMs();
  let cursor = await idx.openCursor();
  while (cursor) {
    const row = cursor.value as OutboxRow;
    if (row.status === 'dead' || row.nextAttemptAt > now) {
      cursor = await cursor.continue();
      continue;
    }
    await cursor.update({ ...row, status: 'syncing' });
    try {
      const res = await fetchFn(`/api/sync/${row.mutation}`, {
        method: 'POST',
        body: JSON.stringify(row.payload),
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': row.idempotencyKey,
          'X-CSRF-Token': readCsrfCookie(),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await cursor.delete();
      stats.ok++;
    } catch (e) {
      const attempts = row.attempts + 1;
      const dead = attempts >= MAX_ATTEMPTS;
      await cursor.update({
        ...row,
        status: dead ? 'dead' : 'failed',
        attempts,
        lastError: String(e),
        nextAttemptAt: calcNextAttempt(attempts, clock),
      });
      dead ? stats.dead++ : stats.failed++;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return stats;
}
