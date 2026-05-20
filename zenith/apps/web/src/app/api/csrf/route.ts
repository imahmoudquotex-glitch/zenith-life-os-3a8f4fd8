import 'server-only';
import { withEnvelope } from '@/lib/api-route';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const GET = withEnvelope(async (_req, _ctx) => {
  const token = crypto.randomBytes(32).toString('hex');
  const res = NextResponse.json({ csrfToken: token });
  res.cookies.set('__csrf', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    path: '/',
    maxAge: 86400,
  });
  // Return the response directly — csrf is special (sets cookie)
  return res;
});
