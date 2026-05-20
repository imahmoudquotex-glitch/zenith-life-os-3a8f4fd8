import 'server-only';

/** PII patterns to redact from logs and audit metadata */
const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replace: string }> = [
  { name: 'email', pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, replace: '[email]' },
  { name: 'phone', pattern: /(\+?[0-9]{1,4}[\s\-]?)?(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/g, replace: '[phone]' },
  { name: 'ip_v4', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replace: '[ip]' },
];

export function redactPii(text: string): string {
  let result = text;
  for (const { pattern, replace } of PII_PATTERNS) {
    result = result.replace(pattern, replace);
  }
  return result;
}

export function redactMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (typeof v === 'string') {
      result[k] = redactPii(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}
