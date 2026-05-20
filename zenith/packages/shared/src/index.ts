/**
 * @zenith/shared — Public API
 * Phase 01: Full shared package with all modules.
 */

// ─── IDs ───────────────────────────────────────────────
export { createUlid, isUlid, assertUlid, ulidToTimestamp, ULID_REGEX, ULID_CHECK_SQL } from './ids/ulid'
export type { Ulid } from './ids/ulid'

// ─── Errors ────────────────────────────────────────────
export { ErrorRegistry, ZenithError } from './errors/registry'
export type { ErrorCode } from './errors/registry'

// ─── Result ────────────────────────────────────────────
export { ok, err, isOk, isErr, unwrap, unwrapOr, map, mapErr, flatMap, fromPromise } from './errors/result'
export type { Ok, Err, Result } from './errors/result'

// ─── Money ─────────────────────────────────────────────
export { cents, money, addCents, subtractCents, formatMoney, isValidMoneyColumnName } from './money/index'
export type { Cents, Money } from './money/index'

// ─── Time ──────────────────────────────────────────────
export { systemClock, fixedClock, monotonicClock } from './time/index'
export type { Clock } from './time/index'

// ─── Envelope ──────────────────────────────────────────
export { respondOk, respondErr } from './envelope/index'
export type { ApiSuccessEnvelope, ApiErrorEnvelope, ApiEnvelope, EnvelopeMeta } from './envelope/index'

// ─── Pagination ────────────────────────────────────────
export { encodeCursor, decodeCursor, buildCursorPage, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './pagination/index'
export type { CursorPage } from './pagination/index'

// ─── Logger ────────────────────────────────────────────
export { logger } from './logger'
export type { Logger, LogContext } from './logger'

// ─── Env ───────────────────────────────────────────────
export { env, resetEnv } from './env'

// ─── Design Tokens ─────────────────────────────────────
export { tokens } from './tokens/design-tokens'
export type { DesignTokens } from './tokens/design-tokens'
