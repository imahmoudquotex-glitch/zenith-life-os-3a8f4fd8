// packages/offline/src/index.ts
// Wave: W03 — Public API for offline package

export { getOfflineDB, clearOfflineDB, purgeOldSnapshots } from './db';
export type { OutboxRow, OutboxStatus, SnapshotRow } from './db';
export { enqueueMutation, getPendingMutations, getDeadLetters, markSynced, markFailed, dismissDeadLetter, getOutboxCount } from './outbox';
export { calcNextAttempt, isDead } from './backoff';
export { getStrategy, resolve } from './conflict';
export type { Strategy, ConflictWinner } from './conflict';
export { isOnline, onConnectivityChange } from './connectivity';
export { processSyncQueue, startSyncEngine } from './sync';
export { saveSnapshot, getSnapshot, deleteSnapshot, listSnapshots } from './snapshot';
