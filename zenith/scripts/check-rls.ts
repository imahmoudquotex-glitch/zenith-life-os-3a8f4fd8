/**
 * RLS Policy Checker — Phase 00+01 Invariant
 * Every tenant table MUST have ENABLE + FORCE RLS + isolation policy.
 * Scans ALL SQL migration files holistically (RLS may be in a separate file). ؤؤ
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Tables exempt from RLS requirement
const EXEMPT_TABLES = new Set<string>([
  'webhook_nonces' // Utility/system table that doesn't need RLS
])

const SKIP_PREFIXES = ['pg_', 'information_schema', '_']

interface TableInfo {
  name: string
  file: string
  hasEnableRLS: boolean
  hasForceRLS: boolean
  hasPolicy: boolean
}

function run(): void {
  const migrationsDir = process.argv[2] || join(process.cwd(), 'supabase', 'migrations')

  let allFiles: string[]
  try {
    allFiles = (readdirSync(migrationsDir, { recursive: true }) as string[])
      .filter(f => f.endsWith('.sql'))
  } catch {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  No migrations directory found at ${migrationsDir} — skipping`)
    return
  }

  // Concat ALL migration content to check cross-file references
  const allContent = allFiles
    .map(f => readFileSync(join(migrationsDir, f), 'utf-8'))
    .join('\n')

  // Find all CREATE TABLE statements
  const tables = new Map<string, TableInfo>()
  const tableRegex = /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi
  let match: RegExpExecArray | null

  for (const file of allFiles) {
    const content = readFileSync(join(migrationsDir, file), 'utf-8')
    const fileName = file.split(/[/\\]/).pop() || ''
    tableRegex.lastIndex = 0

    while ((match = tableRegex.exec(content)) !== null) {
      const tableName = match[1]!
      if (EXEMPT_TABLES.has(tableName)) continue
      if (SKIP_PREFIXES.some(p => tableName.startsWith(p))) continue

      tables.set(tableName, {
        name: tableName,
        file: fileName,
        hasEnableRLS: false,
        hasForceRLS: false,
        hasPolicy: false,
      })
    }
  }

  // Now check across ALL content for ENABLE/FORCE/POLICY
  for (const [tableName, info] of tables) {
    const enablePattern = new RegExp(
      `ALTER TABLE\\s+(?:public\\.)?${tableName}\\s+ENABLE ROW LEVEL SECURITY`,
      'i',
    )
    const forcePattern = new RegExp(
      `ALTER TABLE\\s+(?:public\\.)?${tableName}\\s+FORCE ROW LEVEL SECURITY`,
      'i',
    )
    const policyPattern = new RegExp(
      `CREATE POLICY\\s+\\w+\\s+ON\\s+(?:public\\.)?${tableName}`,
      'i',
    )

    info.hasEnableRLS = enablePattern.test(allContent)
    info.hasForceRLS = forcePattern.test(allContent)
    info.hasPolicy = policyPattern.test(allContent)
  }

  // Report violations
  const violations: string[] = []
  for (const [, info] of tables) {
    if (!info.hasEnableRLS) {
      violations.push(`${info.file}: Table "${info.name}" missing ENABLE ROW LEVEL SECURITY`)
    }
    if (!info.hasForceRLS) {
      violations.push(`${info.file}: Table "${info.name}" missing FORCE ROW LEVEL SECURITY`)
    }
    if (!info.hasPolicy) {
      violations.push(`${info.file}: Table "${info.name}" missing RLS policy`)
    }
  }

  if (violations.length > 0) {
    console.error('❌ RLS violations found:\n')
    for (const v of violations) {
      console.error(`  • ${v}`)
    }
    console.error(`\n Total: ${violations.length} violations`)
    process.exit(1)
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ All tables have proper RLS policies')
  }
}

run()
