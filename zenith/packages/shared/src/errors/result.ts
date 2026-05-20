/**
 * Result Pattern — Functional error handling.
 * Phase 01: Use Result<T, E> instead of throw/catch for business logic.
 */

// ─── Types ─────────────────────────────────────────────

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

export type Result<T, E = Error> = Ok<T> | Err<E>

// ─── Constructors ──────────────────────────────────────

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

// ─── Guards ────────────────────────────────────────────

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok
}

// ─── Utilities ─────────────────────────────────────────

/**
 * Unwrap a Result, throwing if Err.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value
  throw result.error instanceof Error
    ? result.error
    : new Error(String(result.error))
}

/**
 * Unwrap a Result with a default value for Err.
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue
}

/**
 * Map the value of an Ok Result.
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result
}

/**
 * Map the error of an Err Result.
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error))
}

/**
 * FlatMap / chain for Result.
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result
}

/**
 * Wrap a promise into a Result.
 */
export async function fromPromise<T>(
  promise: Promise<T>,
): Promise<Result<T, Error>> {
  try {
    return ok(await promise)
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}
