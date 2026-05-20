import { AppError } from './app-error';

export class ForbiddenError extends AppError {
  constructor(reason?: string) { super('AUTH_003', reason ? { reason } : undefined); }
}
export class RateLimitError extends AppError {
  constructor(remaining = 0, retryAfter = 60) {
    super('SYS_003', { remaining, retryAfter });
  }
}
export class ValidationError extends AppError {
  constructor(fields: Record<string, string[]>) {
    super('DATA_002', { fields });
  }
}
export class QuotaExceededError extends AppError {
  constructor(usage: { used: number; limit: number; resetAt?: string }) {
    super('SYS_007', usage);
  }
}
export class IdempotencyMismatchError extends AppError {
  constructor() { super('SYS_006'); }
}
export class IdempotencyRequiredError extends AppError {
  constructor() { super('SYS_005'); }
}
export class InternalError extends AppError {
  constructor() { super('SYS_001'); }
}
