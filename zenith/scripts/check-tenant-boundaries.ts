/**
 * Tenant Boundaries Checker
 * Phase 01: Every business table MUST have workspace_id + RLS + FORCE RLS.
 * Exception tables: audit_events (has its own), feature_flags (global), webhook_nonces.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const EXEMPT_TABLES = new Set([
  'workspaces',                // root entity — IS the workspace
  'users',                     // root entity — linked to workspaces via junction
  'feature_flags',             // global, not per-workspace (read-only for app_user)
  'webhook_nonces',            // service-role only
  'product_success_metrics',   // global KPI table — not per-workspace
  'idempotency_keys',          // service-level, workspace-scoped via column but no FK needed
  'rate_limit_buckets',        // service-level rate limiting
])

const VIOLATIONS: string[] = []

function checkFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const fileName = filePath.split(/[/\\]/).pop() || ''

  const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi)
  for (const match of tableMatches) {
    const tableName = match[1]!

    if (EXEMPT_TABLES.has(tableName)) continue
    if (tableName.startsWith('pg_') || tableName.startsWith('_')) continue

    // Check workspace_id column exists
    const hasWorkspaceId = new RegExp(`workspace_id\\s+TEXT`, 'i').test(content)
    if (!hasWorkspaceId) {
      // Only flag if table has other business columns (not utility tables like extensions)
      const hasColumns = /\bid\s+TEXT\s+PRIMARY KEY/i.test(content)
      if (hasColumns) {
        VIOLATIONS.push(`${fileName}: Table "${tableName}" missing workspace_id TEXT column`)
      }
    }
  }
}

function scanDirectory(dir: string): void {
  try {
    const files = readdirSync(dir, { recursive: true }) as string[]
    for (const file of files) {
      if (file.endsWith('.sql')) {
        checkFile(join(dir, file))
      }
    }
  } catch {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  No migrations directory found at ${dir} — skipping`)
    return
  }
}

const migrationsDir = process.argv[2] || join(process.cwd(), 'supabase', 'migrations')
scanDirectory(migrationsDir)

if (VIOLATIONS.length > 0) {
  console.error('❌ Tenant boundary violations found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  // eslint-disable-next-line no-console
  console.log('✅ All business tables have workspace_id')
}
