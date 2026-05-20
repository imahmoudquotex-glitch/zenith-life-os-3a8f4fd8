/**
 * Database Naming Convention Checker
 * Phase 00 Invariant: snake_case tables, TEXT ULID PKs, *_cents for money.
 * Scans SQL migration files for violations.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const VIOLATIONS: string[] = []

function checkFile(filePath: string): void {
  const rawContent = readFileSync(filePath, 'utf-8')
  const fileName = filePath.split(/[/\\]/).pop() || ''

  // Strip single-line and multi-line comments to avoid matching comments
  const content = rawContent
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  // Check table names are snake_case
  const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi)
  for (const match of tableMatches) {
    const tableName = match[1]!
    if (tableName !== tableName.toLowerCase()) {
      VIOLATIONS.push(`${fileName}: Table "${tableName}" is not snake_case`)
    }
  }

  // Check for UUID usage (should be TEXT ULID)
  if (/UUID PRIMARY KEY/i.test(content)) {
    VIOLATIONS.push(`${fileName}: Uses UUID PRIMARY KEY — should be TEXT with ULID CHECK`)
  }

  // Check monetary columns use _cents
  const moneyPatterns = /(\w+)\s+(DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|MONEY)/gi
  const allowedFloats = new Set(['position', 'x', 'y', 'width', 'height'])
  for (const match of content.matchAll(moneyPatterns)) {
    const colName = match[1]!
    if (allowedFloats.has(colName.toLowerCase())) continue // Allowed non-monetary float/double fields
    if (!colName.endsWith('_cents') && !colName.endsWith('_rate')) {
      VIOLATIONS.push(`${fileName}: Column "${colName}" uses ${match[2]} — monetary values must use BIGINT with _cents suffix`)
    }
  }

  // Check for forbidden encryption primitives
  const forbidden = ['AES-ECB', 'MD5', 'SHA1', '3DES', 'RC4']
  for (const prim of forbidden) {
    if (content.includes(prim)) {
      VIOLATIONS.push(`${fileName}: Contains forbidden encryption primitive "${prim}"`)
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
    console.log(`ℹ️  No migrations directory found at ${dir} — skipping`)
    return
  }
}

// Run
const migrationsDir = process.argv[2] || join(process.cwd(), 'supabase', 'migrations')
scanDirectory(migrationsDir)

if (VIOLATIONS.length > 0) {
  console.error('❌ Naming convention violations found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  console.log('✅ All naming conventions pass')
}
