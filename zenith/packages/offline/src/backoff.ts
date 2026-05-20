import { type Clock, systemClock } from '@zenith/shared/time';

function cryptoRandom(): number {
  // Cryptographically secure random float in [0, 1)
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0]! >>> 0) / 0x1_0000_0000;
}

export function calcNextAttempt(
  attempts: number,
  clock: Clock = systemClock,
): number {
  // exponential with jitter ±20%, max 30 mins
  const base = Math.min(Math.pow(2, attempts) * 1000, 30 * 60 * 1000);
  const jitter = base * (0.8 + cryptoRandom() * 0.4);
  return clock.nowMs() + jitter;
}
