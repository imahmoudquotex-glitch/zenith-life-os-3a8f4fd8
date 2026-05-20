const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = new Set([
  'password', 'token', 'secret', 'key', 'authorization', 'cookie'
]);

export function redactSecrets(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);
  
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      result[k] = REDACTED;
    } else {
      result[k] = redactSecrets(v);
    }
  }
  return result;
}
