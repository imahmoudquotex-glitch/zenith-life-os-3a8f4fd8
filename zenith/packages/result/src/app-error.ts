import { ErrorRegistry, type ErrorCode } from '@app/shared/errors/registry';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly details?: Record<string, unknown>,
    public readonly cause?: unknown,
  ) {
    super(ErrorRegistry[code].message);
    this.name = 'AppError';
  }
  toEnvelope() {
    return {
      code: this.code,
      message: ErrorRegistry[this.code].message,
      details: this.details ?? null,
    };
  }
  get httpStatus(): number { return ErrorRegistry[this.code].httpStatus; }
}
