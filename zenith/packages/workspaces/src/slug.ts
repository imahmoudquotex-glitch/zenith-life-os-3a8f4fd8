/**
 * @zenith/workspaces — Slug utilities
 * Generates URL-safe slugs from workspace/page names.
 * Uses advisory locks to prevent race conditions.
 */

/** Reserved slugs — cannot be used for workspaces */
const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'api', 'auth', 'admin', 'app', 'assets', 'blog', 'cdn',
  'dashboard', 'docs', 'help', 'invite', 'login', 'logout',
  'me', 'new', 'null', 'pricing', 'privacy', 'settings',
  'signup', 'signin', 'signout', 'status', 'support', 'terms',
  'undefined', 'user', 'users', 'workspace', 'workspaces',
  'www', 'static', 'public', 'private', 'internal',
])

/**
 * Convert a string to a URL-safe slug.
 * Rules: lowercase, alphanumeric + hyphens, no leading/trailing hyphens, max 40 chars.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')        // Remove non-word chars
    .replace(/[\s_]+/g, '-')         // Spaces/underscores → hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')         // Trim leading/trailing hyphens
    .substring(0, 40)
}

/**
 * Check if a slug is reserved.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}

/**
 * Generate a unique slug for a workspace.
 * If the base slug collides, appends -2, -3, etc.
 *
 * @param client - Postgres client (within transaction)
 * @param baseName - Human-readable name to slugify
 * @param table - Table to check uniqueness against ('workspaces' | 'pages')
 * @param scopeColumn - Optional scope column (e.g., 'workspace_id' for pages)
 * @param scopeValue - Optional scope value
 */
export async function generateUniqueSlug(
  client: import('pg').PoolClient,
  baseName: string,
  table: 'workspaces' | 'pages',
  scopeColumn?: string,
  scopeValue?: string
): Promise<string> {
  const base = slugify(baseName)

  if (!base) {
    throw new Error('Cannot generate slug from empty input')
  }

  if (table === 'workspaces' && isReservedSlug(base)) {
    // For reserved slugs, start with suffix immediately
    return generateWithSuffix(client, base, table, scopeColumn, scopeValue, 2)
  }

  // Advisory lock to prevent race conditions on same base slug
  const lockKey = scopeValue ? `slug:${scopeValue}:${base}` : `slug:${base}`
  await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [lockKey])

  // Check if base slug is available
  const exists = await checkSlugExists(client, base, table, scopeColumn, scopeValue)

  if (!exists) return base

  return generateWithSuffix(client, base, table, scopeColumn, scopeValue, 2)
}

async function generateWithSuffix(
  client: import('pg').PoolClient,
  base: string,
  table: string,
  scopeColumn?: string,
  scopeValue?: string,
  startAt: number = 2
): Promise<string> {
  for (let i = startAt; i <= 100; i++) {
    const candidate = `${base}-${i}`
    const exists = await checkSlugExists(client, candidate, table, scopeColumn, scopeValue)
    if (!exists) return candidate
  }
  throw new Error(`Cannot generate unique slug for "${base}" after 100 attempts`)
}

async function checkSlugExists(
  client: import('pg').PoolClient,
  slug: string,
  table: string,
  scopeColumn?: string,
  scopeValue?: string
): Promise<boolean> {
  let query: string
  let params: string[]

  if (scopeColumn && scopeValue) {
    query = `SELECT 1 FROM public.${table} WHERE slug = $1 AND ${scopeColumn} = $2 AND is_deleted = FALSE LIMIT 1`
    params = [slug, scopeValue]
  } else {
    query = `SELECT 1 FROM public.${table} WHERE slug = $1 AND is_deleted = FALSE LIMIT 1`
    params = [slug]
  }

  const result = await client.query(query, params)
  return result.rows.length > 0
}

export { RESERVED_SLUGS }
