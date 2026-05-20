import { clientEnvSchema, type ClientEnv } from './schema';

const _parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

let _clientEnv: ClientEnv;

if (!_parsed.success) {
  const missing = _parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`[client-env] Missing or invalid environment variables:\n${missing}`);
  
  _clientEnv = new Proxy({} as ClientEnv, {
    get(target, prop) {
      throw new Error(`[client-env] Cannot read ${String(prop)} because env vars are invalid.`);
    }
  });
} else {
  _clientEnv = _parsed.data;
}

export const clientEnv = _clientEnv;
