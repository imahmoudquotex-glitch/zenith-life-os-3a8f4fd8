/**
 * Wave 03 — Cookie-Based Session Management
 * httpOnly cookies for Supabase auth tokens.
 * SECURITY: Tokens never in localStorage/sessionStorage.
 */

const SESSION_COOKIE = '__zenith_session';
const REFRESH_COOKIE = '__zenith_refresh';

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Set auth session cookies on response.
 * Called after successful sign-in.
 */
export function setSessionCookies(response: Response, tokens: SessionTokens): Response {
  const headers = new Headers(response.headers);
  const cookieBase = 'Path=/; SameSite=Lax; Secure; HttpOnly';

  headers.append('Set-Cookie', `${SESSION_COOKIE}=${tokens.accessToken}; ${cookieBase}; Max-Age=3600`);
  headers.append('Set-Cookie', `${REFRESH_COOKIE}=${tokens.refreshToken}; ${cookieBase}; Max-Age=604800`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Read session tokens from request cookies.
 */
export function getSessionFromCookies(request: Request): SessionTokens | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';

  const accessMatch = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const refreshMatch = cookieHeader.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));

  if (!accessMatch) return null;

  return {
    accessToken: accessMatch[1],
    refreshToken: refreshMatch ? refreshMatch[1] : '',
  };
}

/**
 * Clear session cookies on sign-out.
 */
export function clearSessionCookies(response: Response): Response {
  const headers = new Headers(response.headers);
  const expire = 'Path=/; SameSite=Lax; Secure; HttpOnly; Max-Age=0';

  headers.append('Set-Cookie', `${SESSION_COOKIE}=; ${expire}`);
  headers.append('Set-Cookie', `${REFRESH_COOKIE}=; ${expire}`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Validate that request has a valid session.
 * Returns userId or null.
 */
export async function validateSession(request: Request): Promise<string | null> {
  const session = getSessionFromCookies(request);
  if (!session) return null;

  // TODO: Validate JWT signature and expiry server-side
  // For now, decode the JWT payload without verification (stub)
  try {
    const parts = session.accessToken.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.sub) return null;
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload.sub as string;
  } catch {
    return null;
  }
}
