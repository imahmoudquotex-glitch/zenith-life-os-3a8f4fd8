// @zenith/shared — API Envelope
// Reviewer issue #18: Unified API response shape.

export interface ApiResponseOk<T> {
  readonly ok: true;
  readonly data: T;
  readonly meta?: {
    requestId?: string;
    idempotencyKey?: string;
    [key: string]: unknown;
  };
}

export interface ApiResponseError {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
  readonly meta?: {
    requestId?: string;
    [key: string]: unknown;
  };
}

export type ApiResponse<T> = ApiResponseOk<T> | ApiResponseError;

/**
 * Return a successful JSON response with envelope.
 */
export function jsonOk<T>(
  data: T,
  meta?: { requestId?: string; idempotencyKey?: string },
  status = 200,
): Response {
  const body: ApiResponseOk<T> = { ok: true, data, ...(meta ? { meta } : {}) };
  return Response.json(body, { status });
}

/**
 * Return an error JSON response with envelope.
 */
export function jsonErr(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  meta?: { requestId?: string },
): Response {
  const body: ApiResponseError = {
    ok: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
    ...(meta ? { meta } : {}),
  };
  return Response.json(body, { status });
}
