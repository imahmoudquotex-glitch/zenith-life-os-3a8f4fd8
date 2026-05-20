import { IdempotencyRequiredError } from '@app/result';

export function requireIdempotencyKey(req: Request): string {
  const key = req.headers.get('Idempotency-Key');
  if (!key || key.length < 16) {
    throw new IdempotencyRequiredError();
  }
  return key;
}
