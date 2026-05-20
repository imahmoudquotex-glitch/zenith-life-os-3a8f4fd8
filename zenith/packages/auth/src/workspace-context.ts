/**
 * @zenith/auth — Workspace Context Middleware
 * Sets Postgres session variables for RLS enforcement.
 *
 * INVARIANT: Every DB query MUST go through withWorkspaceContext.
 * Without it, RLS policies return 0 rows.
 */

import type { Pool, PoolClient } from 'pg'

/**
 * Execute a function within a workspace-scoped database transaction.
 * Sets app.user_id and app.workspace_id for RLS policies.
 *
 * Uses SET LOCAL so settings are automatically cleared on COMMIT/ROLLBACK.
 */
export async function withWorkspaceContext<T>(
  pool: Pool,
  args: { userId: string; workspaceId: string },
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`SELECT set_config('app.user_id', $1, true)`, [args.userId])
    await client.query(`SELECT set_config('app.workspace_id', $1, true)`, [args.workspaceId])

    const result = await fn(client)

    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Execute a function with only user context (no workspace).
 * Used for cross-workspace operations like listing workspaces.
 */
export async function withUserContext<T>(
  pool: Pool,
  args: { userId: string },
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`SELECT set_config('app.user_id', $1, true)`, [args.userId])

    const result = await fn(client)

    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
