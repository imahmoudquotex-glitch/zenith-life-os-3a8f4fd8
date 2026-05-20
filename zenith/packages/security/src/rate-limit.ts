/**
 * Rate Limiting — sliding window per user/IP.
 * ADR: operational protection, not monetization gate.
 * Production: replace in-memory store with Redis or DB buckets.
 */

import { systemClock } from '@zenith/shared/time'

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
  /** Key: 'user:userId' or 'ip:address' or 'user:userId:action' */
  key: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfterSec?: number
}

// In-memory store for dev/test. Production: use rate_limit_buckets table.
const _store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = systemClock.nowMs()
  const windowMs = config.windowSec * 1000
  const bucket = Math.floor(now / windowMs)
  const storeKey = `${config.key}:${bucket}`

  const current = _store.get(storeKey) ?? { count: 0, resetAt: now + windowMs - (now % windowMs) }

  if (current.count >= config.limit) {
    const retryAfterSec = Math.ceil((current.resetAt - now) / 1000)
    return { allowed: false, remaining: 0, resetAt: new Date(current.resetAt), retryAfterSec }
  }

  current.count++
  _store.set(storeKey, current)

  // Cleanup: remove expired entries when store grows large
  if (_store.size > 10_000) {
    for (const [k, v] of _store.entries()) {
      if (v.resetAt < now) _store.delete(k)
    }
  }

  return { allowed: true, remaining: config.limit - current.count, resetAt: new Date(current.resetAt) }
}

export function assertRateLimit(config: RateLimitConfig): void {
  const result = checkRateLimit(config)
  if (!result.allowed) {
    const err = Object.assign(
      new Error(`Rate limit exceeded. Retry after ${result.retryAfterSec}s`),
      { code: 'RATE_LIMIT_EXCEEDED', status: 429, retryAfterSec: result.retryAfterSec }
    )
    throw err
  }
}

/** Pre-configured rate limit presets */
export const RATE_LIMITS = {
  api:          { limit: 60,  windowSec: 60    }, // 60 req/min per user
  auth:         { limit: 5,   windowSec: 300   }, // 5 attempts per 5min
  aiCall:       { limit: 10,  windowSec: 60    }, // 10 AI calls/min
  notification: { limit: 5,   windowSec: 3600  }, // 5 notif/hour/type
  vault:        { limit: 30,  windowSec: 60    }, // 30 vault ops/min
  export:       { limit: 3,   windowSec: 3600  }, // 3 exports/hour
} as const
