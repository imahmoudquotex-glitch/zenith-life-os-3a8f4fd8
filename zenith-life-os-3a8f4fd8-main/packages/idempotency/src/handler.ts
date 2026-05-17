// @zenith/idempotency — Idempotency key handler
// Every mutation endpoint must include an Idempotency-Key header.
// This prevents duplicate processing of the same request.

import type { Result } from '@zenith/shared/result';

export interface IdempotencyRecord {
  key: string;
  workspaceId: string;
  userId: string;
  method: string;
  path: string;
  statusCode: number;
  responseBody: unknown;
  createdAt: string;
  expiresAt: string;
}

/**
 * Check if an idempotency key has already been processed.
 * Returns the cached response if so, null if not.
 */
export async function checkIdempotency(
  _key: string,
  _workspaceId: string,
): Promise<Result<IdempotencyRecord | null>> {
  // Stub — will be wired to DB in Wave 01
  return { ok: true, value: null };
}

/**
 * Store a processed idempotency response.
 */
export async function storeIdempotency(
  _record: IdempotencyRecord,
): Promise<Result<void>> {
  // Stub — will be wired to DB in Wave 01
  return { ok: true, value: undefined };
}
