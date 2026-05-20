import 'server-only';
import { serverEnvSchema } from './schema';

const _parsed = serverEnvSchema.safeParse(process.env);

if (!_parsed.success) {
  const missing = _parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`[server-env] Missing or invalid environment variables:\n${missing}`);
}

export const serverEnv = _parsed.data;
