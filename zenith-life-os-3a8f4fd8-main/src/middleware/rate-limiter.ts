/**
 * Wave 03 — Rate Limiter
 * Sliding-window rate limiter using in-memory Map.
 * Production: Use CF Workers KV or D1 for distributed state.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  keyPrefix?: string;     // Prefix for key isolation
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000,      // 1 minute
  maxRequests: 30,
  keyPrefix: 'rl',
};

/**
 * Extract rate limit key from request (IP + path).
 */
function getKey(request: Request, config: RateLimitConfig): string {
  const ip = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'unknown';
  const url = new URL(request.url);
  return `${config.keyPrefix}:${ip}:${url.pathname}`;
}

/**
 * Check rate limit. Returns null if allowed, or error Response if exceeded.
 */
export function checkRateLimit(
  request: Request,
  config: Partial<RateLimitConfig> = {},
): Response | null {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const key = getKey(request, cfg);
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > cfg.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(JSON.stringify({
      ok: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(cfg.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
      },
    });
  }

  return null;
}

/** Auth-specific rate limit: 10 attempts per 5 minutes */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60_000,
  maxRequests: 10,
  keyPrefix: 'auth',
};

/** API-specific rate limit: 100 requests per minute */
export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 100,
  keyPrefix: 'api',
};
