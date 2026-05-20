// packages/offline/src/snapshot.ts
// Wave: W03 — Local snapshot store for optimistic UI

import { getOfflineDB, type SnapshotRow } from './db';

/**
 * Store a local snapshot of an entity for optimistic reads.
 */
export async function saveSnapshot(row: Omit<SnapshotRow, 'cachedAt'>): Promise<void> {
  const db = await getOfflineDB();
  await db.put('snapshots', { ...row, cachedAt: Date.now() });
}

/**
 * Get a cached snapshot of an entity.
 */
export async function getSnapshot(entityType: string, entityId: string): Promise<SnapshotRow | undefined> {
  const db = await getOfflineDB();
  return db.get('snapshots', [entityType, entityId]) as Promise<SnapshotRow | undefined>;
}

/**
 * Delete a snapshot (after successful server sync).
 */
export async function deleteSnapshot(entityType: string, entityId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('snapshots', [entityType, entityId]);
}

/**
 * List all snapshots for an entity type.
 */
export async function listSnapshots(entityType: string): Promise<SnapshotRow[]> {
  const db = await getOfflineDB();
  const tx = db.transaction('snapshots', 'readonly');
  return tx.objectStore('snapshots').index('byEntityType').getAll(entityType) as Promise<SnapshotRow[]>;
}
