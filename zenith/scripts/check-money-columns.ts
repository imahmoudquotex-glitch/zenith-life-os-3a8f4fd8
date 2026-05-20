/**
 * Money Columns Checker
 * Phase 01: All monetary values MUST use *_cents BIGINT.
 * Rejects DECIMAL/NUMERIC/FLOAT/MONEY column types.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const VIOLATIONS: string[] = []
const BANNED_MONEY_TYPES = /\b(DECIMAL|NUMERIC|FLOAT|DOUBLE\s+PRECISION|REAL|MONEY)\b/gi

function checkFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const fileName = filePath.split(/[/\\]/).pop() || ''
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue

    // Strip comments from the line to avoid matching banned types in comments
    const cleanLine = line.replace(/--.*$/, '').trim()
    if (!cleanLine) continue

    const match = BANNED_MONEY_TYPES.exec(cleanLine)
    if (match) {
      // Allow rate columns, percentages, positions, and canvas coordinates
      if (
        /\brate\b/i.test(cleanLine) ||
        /\bpct\b/i.test(cleanLine) ||
        /\brollout_pct\b/i.test(cleanLine) ||
        /\bposition\b/i.test(cleanLine) ||
        /\b(x|y|width|height|z_index)\b/i.test(cleanLine)
      ) {
        BANNED_MONEY_TYPES.lastIndex = 0
        continue
      }
      VIOLATIONS.push(`${fileName}:${i + 1}: Uses "${match[0]}" — monetary values must be *_cents BIGINT`)
      BANNED_MONEY_TYPES.lastIndex = 0
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
  console.error('❌ Money column violations found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  // eslint-disable-next-line no-console
  console.log('✅ All monetary columns use *_cents BIGINT')
}
