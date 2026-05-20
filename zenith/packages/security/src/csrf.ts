import 'server-only';
import crypto from 'node:crypto';

/** Double-submit CSRF cookie pattern */

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfTokens(cookieToken: string | undefined, headerToken: string | undefined): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieToken, 'hex'), Buffer.from(headerToken, 'hex'));
  } catch {
    return false;
  }
}

export function checkOrigin(originHeader: string | null, appUrl: string): boolean {
  if (!originHeader) return false;
  try {
    const origin = new URL(originHeader);
    const app = new URL(appUrl);
    return origin.hostname === app.hostname && origin.protocol === app.protocol;
  } catch {
    return false;
  }
}
