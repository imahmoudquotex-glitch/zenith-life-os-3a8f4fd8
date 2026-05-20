/**
 * API Envelope — Standard response wrapper.
 * Phase 01: Every API response MUST use this envelope.
 * Format: { ok, data?, error?, meta }
 */

// ─── Types ─────────────────────────────────────────────

export interface EnvelopeMeta {
  /** Unique request ID for tracing */
  requestId: string
  /** ISO timestamp of response */
  timestamp: string
  /** Pagination cursor for list endpoints */
  cursor?: string
  /** Whether there are more results */
  hasMore?: boolean
}

export interface ApiSuccessEnvelope<T> {
  ok: true
  data: T
  meta: EnvelopeMeta
}

export interface ApiErrorEnvelope {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
    retry: boolean
  }
  meta: EnvelopeMeta
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope

// ─── Builders ──────────────────────────────────────────

/**
 * Build a success envelope.
 */
export function respondOk<T>(
  data: T,
  requestId: string,
  extra?: Partial<Omit<EnvelopeMeta, 'requestId' | 'timestamp'>>,
): ApiSuccessEnvelope<T> {
  return {
    ok: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...extra,
    },
  }
}

/**
 * Build an error envelope.
 */
export function respondErr(
  code: string,
  message: string,
  requestId: string,
  options?: { details?: unknown; retry?: boolean },
): ApiErrorEnvelope {
  return {
    ok: false,
    error: {
      code,
      message,
      details: options?.details,
      retry: options?.retry ?? false,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  }
}
