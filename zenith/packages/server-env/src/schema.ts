import 'server-only';
import { z } from 'zod';

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(20),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  AUTH_JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(5).optional(),
  RESEND_API_KEY: z.string().min(10).optional(),
  SENTRY_DSN: z.string().url().optional(),
  AXIOM_TOKEN: z.string().min(10).optional(),
  STRIPE_SECRET_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  ANTHROPIC_API_KEY: z.string().min(10).optional(),
  N8N_WEBHOOK_SECRET: z.string().min(20).optional(),
  MERACL_API_KEY: z.string().min(20).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
