/**
 * @zenith/idempotency — Idempotency-Key middleware
 *
 * ADR-0007: POST/PATCH/PUT/DELETE require Idempotency-Key header.
 * Hash = sha256(method + path + sortedBody)
 * States: pending → completed | conflict | mismatch
 */

export interface IdempotencyRecord {
  readonly key: string
  readonly workspaceId: string
  readonly requestHash: string
  readonly status: 'pending' | 'completed' | 'conflict'
  readonly responseBody?: string
  readonly responseStatus?: number
  readonly lockedAt: string
  readonly completedAt?: string
  readonly expiresAt: string
}

export interface IdempotencyStore {
  /** Try to acquire a lock. Returns existing record if already exists. */
  acquire(
    key: string,
    workspaceId: string,
    requestHash: string,
    ttlSeconds?: number,
  ): Promise<{ acquired: true } | { acquired: false; existing: IdempotencyRecord }>

  /** Mark a key as completed with response */
  complete(
    key: string,
    workspaceId: string,
    responseBody: string,
    responseStatus: number,
  ): Promise<void>

  /** Release a lock (on error, before completion) */
  release(key: string, workspaceId: string): Promise<void>
}

/**
 * Compute request hash for idempotency comparison.
 */
export async function computeRequestHash(
  method: string,
  path: string,
  body: unknown,
): Promise<string> {
  const sortedBody = JSON.stringify(body, Object.keys(body as object).sort())
  const payload = `${method}:${path}:${sortedBody}`
  const encoder = new TextEncoder()
  const data = encoder.encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
