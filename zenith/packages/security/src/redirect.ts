export function safeRedirectPath(input: string | null, fallback = '/today'): string {
  if (!input) return fallback;
  if (!input.startsWith('/')) return fallback;
  if (input.startsWith('//')) return fallback;
  if (/[\r\n\\]/.test(input)) return fallback;
  try {
    const u = new URL(input, 'http://internal');
    if (u.hostname !== 'internal') return fallback;
  } catch { return fallback; }
  if (input.length > 512) return fallback;
  return input;
}
