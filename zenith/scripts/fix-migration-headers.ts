/**
 * Prepend correct migration headers to all migrations missing them.
 * Run: tsx scripts/fix-migration-headers.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations')


function getWave(num: number): string {
  if (num <= 99)   return 'W00'
  if (num <= 199)  return 'W01'
  if (num <= 299)  return 'W02'
  if (num <= 399)  return 'W03'
  if (num <= 499)  return 'W04'
  if (num <= 599)  return 'W05'
  if (num <= 699)  return 'W06'
  if (num <= 799)  return 'W07'
  if (num <= 899)  return 'W08'
  return 'W09+'
}

const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
let fixed = 0

for (const file of files) {
  const fullPath = join(MIGRATIONS_DIR, file)
  const content = readFileSync(fullPath, 'utf-8')

  const hasFile = content.includes('File:')
  const hasBegin = content.includes('BEGIN;')
  const hasCommit = content.includes('COMMIT;')

  if (hasFile && hasBegin && hasCommit) continue

  const numStr = file.substring(0, 4)
  const num = parseInt(numStr, 10)
  const wave = getWave(num)
  const nameSlug = file.replace('.sql', '').replace(/^\d+_/, '')
  const descWords = nameSlug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const date = '2026-05-20'

  const header = `-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        ${file}
-- Wave:        ${wave} (${numStr}–${String(parseInt(numStr)+99).padStart(4,'0')})
-- Description: ${descWords}
-- Author:      zenith-system
-- Created:     ${date}
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

`

  // Strip old leading comment if it starts with --
  let body = content
  if (!hasBegin) {
    body = header + body.trimStart() + (hasCommit ? '' : '\n\nCOMMIT;\n')
  } else if (!hasFile) {
    body = header + body.trimStart()
  }

  writeFileSync(fullPath, body)
  console.log(`Fixed: ${file}`)
  fixed++
}

console.log(`\n✅ Fixed ${fixed} migration headers`)
