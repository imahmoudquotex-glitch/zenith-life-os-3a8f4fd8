// @zenith/idempotency — Idempotency Key Manager
// Ensures mutations are not processed twice.

import type { Result } from '@zenith/shared/result';

export interface IdempotencyRecord {
  readonly key: string;
  readonly workspaceId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly createdAt: string;
}

export interface IdempotencyStore {
  check(key: string, workspaceId: string): Promise<Result<IdempotencyRecord | null>>;
  save(record: IdempotencyRecord): Promise<Result<void>>;
}

/**
 * Validate idempotency key format.
 * Must be at least 16 characters, alphanumeric + hyphens.
 */
export function isValidIdempotencyKey(key: string): boolean {
  return key.length >= 16 && /^[a-zA-Z0-9-]+$/.test(key);
}
