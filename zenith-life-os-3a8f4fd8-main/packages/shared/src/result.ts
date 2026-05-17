// @zenith/shared — Result pattern
// Reviewer issue #22: No throw new Error in business logic. Use Result<T,E>.

export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.ok) {
    return err(fn(result.error));
  }
  return result;
}

export function tryCatch<T>(fn: () => T, toError: (e: unknown) => AppError): Result<T, AppError> {
  try {
    return ok(fn());
  } catch (e: unknown) {
    return err(toError(e));
  }
}

export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  toError: (e: unknown) => AppError,
): Promise<Result<T, AppError>> {
  try {
    return ok(await fn());
  } catch (e: unknown) {
    return err(toError(e));
  }
}
