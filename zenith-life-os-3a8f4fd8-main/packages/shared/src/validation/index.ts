// @zenith/shared — Validation utilities
// Zod-based validation with Result pattern integration

import type { Result, AppError } from '../result';

/**
 * Validate data against a Zod schema, returning Result instead of throwing.
 * Usage: const result = validate(schema, data);
 */
export function validate<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { issues: unknown[] } } },
  data: unknown,
): Result<T, AppError> {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return { ok: true, value: parsed.data as T };
  }
  return {
    ok: false,
    error: {
      code: 'VALIDATION_FAILED',
      message: 'Input validation failed',
      details: parsed.error?.issues,
    },
  };
}
