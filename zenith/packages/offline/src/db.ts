// packages/offline/src/db.ts
// Wave: W03 — IndexedDB schema for offline kernel
// Browser-only. ESLint prevents import in server code.

import { openDB, type IDBPDatabase } from 'idb';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OutboxStatus = 'pending' | 'syncing' | 'failed' | 'dead';

export type OutboxRow = {
  id: string;              // ULID — also used as Idempotency-Key
  mutation: string;        // e.g. 'tasks.update'
  payload: unknown;        // request body (no vault plaintext)
  workspaceId: string;
  userId: string;
  idempotencyKey: string;  // = id — crypto.randomUUID() at creation, no reuse
  bodyHash: string;        // SHA-256 hex of JSON.stringify(payload) for dedup
  status: OutboxStatus;
  attempts: number;
  createdAt: number;       // Date.now()
  nextAttemptAt: number;   // Date.now() + backoff
  lastError?: string;
  conflictPolicy: 'last_write_wins' | 'server_wins' | 'show_conflict';
};

export type SnapshotRow = {
  entityType: string;
  entityId: string;
  data: unknown;           // cached entity state (no vault plaintext)
  version: number;
  serverUpdatedAt: string;
  cachedAt: number;
};

export type MetaRow = {
  key: string;
  value: unknown;
};

// ──────────────────────────────────────────────
// DB singleton
// ──────────────────────────────────────────────

const DB_NAME = 'zenith-offline';
const DB_VERSION = 3;

let _dbPromise: Promise<IDBPDatabase> | null = null;

export function getOfflineDB(): Promise<IDBPDatabase> {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1: outbox store
        if (oldVersion < 1) {
          const outbox = db.createObjectStore('outbox', { keyPath: 'id' });
          outbox.createIndex('byStatus', 'status');
          outbox.createIndex('byNextAttempt', 'nextAttemptAt');
          outbox.createIndex('byWorkspace', 'workspaceId');
        }
        // v2: snapshots store
        if (oldVersion < 2) {
          const snapshots = db.createObjectStore('snapshots', {
            keyPath: ['entityType', 'entityId'],
          });
          snapshots.createIndex('byEntityType', 'entityType');
          snapshots.createIndex('byCachedAt', 'cachedAt');
        }
        // v3: meta store (sync cursor, last-sync-at, etc.)
        if (oldVersion < 3) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return _dbPromise;
}

/**
 * Wipe entire offline DB on logout.
 * MUST be called before clearing auth session.
 */
export async function clearOfflineDB(): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction(['outbox', 'snapshots', 'meta'], 'readwrite');
  await Promise.all([
    tx.objectStore('outbox').clear(),
    tx.objectStore('snapshots').clear(),
    tx.objectStore('meta').clear(),
  ]);
  await tx.done;
}

/**
 * Purge snapshots older than maxAgeMs from cachedAt.
 */
export async function purgeOldSnapshots(maxAgeMs = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  const db = await getOfflineDB();
  const tx = db.transaction('snapshots', 'readwrite');
  const store = tx.objectStore('snapshots');
  const cutoff = Date.now() - maxAgeMs;
  let deleted = 0;
  let cursor = await store.index('byCachedAt').openCursor();
  while (cursor) {
    const row = cursor.value as SnapshotRow;
    if (row.cachedAt < cutoff) {
      await cursor.delete();
      deleted++;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return deleted;
}
