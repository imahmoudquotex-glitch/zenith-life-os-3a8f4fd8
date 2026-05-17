// @zenith/shared — AppError class
// Reviewer issue #22: Structured errors with codes, not raw strings.

export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): { code: string; message: string; details?: unknown } {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}
