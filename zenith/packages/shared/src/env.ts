/**
 * Env — Validated environment variables.
 * Phase 01: `process.env.X` is BANNED outside this module.
 * All env access goes through this validated schema.
 */

// ─── Schema ────────────────────────────────────────────

interface EnvSchema {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string | undefined
  SUPABASE_PROJECT_ID?: string | undefined

  // AI
  OPENAI_API_KEY?: string | undefined
  ANTHROPIC_API_KEY?: string | undefined

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined
  OTEL_SERVICE_NAME?: string | undefined

  // PWA/Push
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string | undefined
  VAPID_PRIVATE_KEY?: string | undefined
  VAPID_SUBJECT?: string | undefined

  // Feature Flags
  NEXT_PUBLIC_WHISPER_MODE: boolean
  NEXT_PUBLIC_AI_ENABLED: boolean

  // Runtime
  NODE_ENV: 'development' | 'production' | 'test'
}

// ─── Validators ────────────────────────────────────────

function requireString(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`ENV_MISSING: "${key}" is required but not set`)
  }
  return value.trim()
}

function optionalString(key: string): string | undefined {
  const value = process.env[key]
  return value?.trim() || undefined
}

function parseBoolean(key: string, fallback: boolean): boolean {
  const value = process.env[key]
  if (value === undefined || value === '') return fallback
  return value === 'true' || value === '1'
}

// ─── Parsed Env ────────────────────────────────────────

let _env: EnvSchema | null = null

/**
 * Get validated environment variables.
 * Throws on first call if required vars are missing.
 * Cached after first successful validation.
 */
export function env(): EnvSchema {
  if (_env) return _env

  _env = {
    NEXT_PUBLIC_SUPABASE_URL: requireString('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireString('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: optionalString('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_PROJECT_ID: optionalString('SUPABASE_PROJECT_ID'),
    OPENAI_API_KEY: optionalString('OPENAI_API_KEY'),
    ANTHROPIC_API_KEY: optionalString('ANTHROPIC_API_KEY'),
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalString('OTEL_EXPORTER_OTLP_ENDPOINT'),
    OTEL_SERVICE_NAME: optionalString('OTEL_SERVICE_NAME') ?? 'zenith-api',
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: optionalString('NEXT_PUBLIC_VAPID_PUBLIC_KEY'),
    VAPID_PRIVATE_KEY: optionalString('VAPID_PRIVATE_KEY'),
    VAPID_SUBJECT: optionalString('VAPID_SUBJECT'),
    NEXT_PUBLIC_WHISPER_MODE: parseBoolean('NEXT_PUBLIC_WHISPER_MODE', false),
    NEXT_PUBLIC_AI_ENABLED: parseBoolean('NEXT_PUBLIC_AI_ENABLED', true),
    NODE_ENV: (process.env['NODE_ENV'] as EnvSchema['NODE_ENV']) || 'development',
  }

  return _env as EnvSchema
}

/**
 * Reset cached env (for testing).
 */
export function resetEnv(): void {
  _env = null
}
