/**
 * Migration Header Checker
 * Phase 00 Invariant: Every .sql migration must have the required header format.
 * Header: -- File: NNNN__<slug>.sql / Wave / Description / Author / Created / Idempotent:YES
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const REQUIRED_FIELDS = ['File:', 'Wave', 'Description', 'Author', 'Created', 'Idempotent']
const VIOLATIONS: string[] = []

function checkFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const fileName = filePath.split(/[/\\]/).pop() || ''

  // Check first 10 lines for header
  const headerLines = content.split('\n').slice(0, 10).join('\n')

  for (const field of REQUIRED_FIELDS) {
    if (!headerLines.includes(field)) {
      VIOLATIONS.push(`${fileName}: Missing "${field}" in migration header`)
    }
  }

  // Check for BEGIN/COMMIT wrapper
  if (!content.includes('BEGIN') || !content.includes('COMMIT')) {
    VIOLATIONS.push(`${fileName}: Missing BEGIN/COMMIT transaction wrapper`)
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
  console.error('❌ Migration header violations found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  console.log('✅ All migration headers valid')
}
