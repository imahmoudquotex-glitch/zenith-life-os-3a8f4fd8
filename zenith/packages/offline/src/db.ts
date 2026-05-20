import { openDB, type IDBPDatabase } from 'idb';

export type OutboxStatus = 'pending' | 'syncing' | 'failed' | 'dead';

export type OutboxRow = {
  id: string;
  mutation: string;
  payload: unknown;
  workspaceId: string;
  userId: string;
  idempotencyKey: string;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
  nextAttemptAt: number;
  schemaVersion: 1;
};

export type SnapshotRow = {
  entityType: string;
  entityId: string;
  data: unknown;
  version: number;
  serverUpdatedAt: string;
  cachedAt: number;
};

let dbPromise: Promise<IDBPDatabase> | undefined;

export function getOfflineDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('zenith-offline', 3, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const o = db.createObjectStore('outbox', { keyPath: 'id' });
          o.createIndex('byStatus', 'status');
          o.createIndex('byNextAttempt', 'nextAttemptAt');
          o.createIndex('byWorkspace', 'workspaceId');
        }
        if (oldVersion < 2) {
          const s = db.createObjectStore('snapshots', { keyPath: ['entityType', 'entityId'] });
          s.createIndex('byEntityType', 'entityType');
        }
        if (oldVersion < 3) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/** Wipe all offline data on logout */
export async function wipeOfflineDB(): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction(['outbox', 'snapshots', 'meta'], 'readwrite');
  await tx.objectStore('outbox').clear();
  await tx.objectStore('snapshots').clear();
  await tx.objectStore('meta').clear();
  await tx.done;
}
