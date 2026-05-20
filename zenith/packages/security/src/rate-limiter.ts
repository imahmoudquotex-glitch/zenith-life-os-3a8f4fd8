import { Redis } from '@upstash/redis';
import { RateLimitError } from '@app/result';

const redis = Redis.fromEnv();

export async function rateLimit(key: string, limit: number, windowSec: number) {
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, windowSec);
  if (current > limit) {
    const ttl = await redis.ttl(key);
    throw new RateLimitError(0, ttl > 0 ? ttl : windowSec);
  }
}
