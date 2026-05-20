// packages/offline/src/sync.ts
// Wave: W03 — Offline outbox sync engine

import { getPendingMutations, markSynced, markFailed } from './outbox';
import { calcNextAttempt, isDead } from './backoff';
import { isOnline } from './connectivity';

const MAX_ATTEMPTS = 8;

type SyncStats = { ok: number; failed: number; dead: number };

/**
 * Read the CSRF cookie value (set by /api/csrf endpoint).
 * Used to include CSRF token in sync requests.
 */
function readCsrfCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]!) : '';
}

/**
 * Process the sync queue — attempt to send all pending outbox mutations.
 * Should be called:
 *   - On online event
 *   - On 60s interval when tab is visible
 *   - After background sync event (Service Worker)
 */
export async function processSyncQueue(fetchFn = fetch): Promise<SyncStats> {
  if (!isOnline()) return { ok: 0, failed: 0, dead: 0 };

  const stats: SyncStats = { ok: 0, failed: 0, dead: 0 };
  const mutations = await getPendingMutations();

  for (const row of mutations) {
    try {
      const res = await fetchFn(`/api/v1/sync/${row.mutation}`, {
        method: 'POST',
        body: JSON.stringify(row.payload),
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': row.idempotencyKey,
          'X-CSRF-Token': readCsrfCookie(),
        },
      });

      if (res.status === 409) {
        // Idempotency duplicate — already processed, safe to remove
        await markSynced(row.id);
        stats.ok++;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      await markSynced(row.id);
      stats.ok++;
    } catch (err) {
      const newAttempts = row.attempts + 1;
      const dead = isDead(newAttempts, MAX_ATTEMPTS);
      await markFailed(
        row.id,
        String(err),
        calcNextAttempt(newAttempts),
        dead,
      );
      dead ? stats.dead++ : stats.failed++;
    }
  }

  return stats;
}

/**
 * Start the sync engine — listens for online events + polls every 60s.
 * Returns a cleanup function.
 */
export function startSyncEngine(): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;

  const run = () => { void processSyncQueue(); };

  // Sync on coming online
  window.addEventListener('online', run);

  // Poll every 60s when visible
  const startTimer = () => {
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') run();
    }, 60_000);
  };
  const stopTimer = () => {
    if (timer) { clearInterval(timer); timer = null; }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      run();
      startTimer();
    } else {
      stopTimer();
    }
  });

  if (document.visibilityState === 'visible') {
    run();
    startTimer();
  }

  return () => {
    window.removeEventListener('online', run);
    stopTimer();
  };
}
