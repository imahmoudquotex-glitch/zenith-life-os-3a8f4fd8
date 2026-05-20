/**
 * Vault Leak Checker
 * Phase 01 INV-05: Vault content must NEVER appear in AI context,
 * analytics, audit fields, logs, or client-side storage.
 *
 * Scans TypeScript files for patterns that could leak vault data.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SKIP_DIRS = ['node_modules', '.git', 'dist', '.next', 'coverage', 'scripts']
const SCAN_EXTENSIONS = ['.ts', '.tsx']
const VIOLATIONS: string[] = []

const LEAK_PATTERNS = [
  { pattern: /vault.*\.(content|plaintext|decrypted).*(?:openai|anthropic|ai)/gi, reason: 'Vault content passed to AI provider' },
  { pattern: /localStorage\.setItem\(.*vault/gi, reason: 'Vault data in localStorage' },
  { pattern: /sessionStorage\.setItem\(.*vault/gi, reason: 'Vault data in sessionStorage' },
  { pattern: /indexedDB.*vault.*(?:put|add)/gi, reason: 'Vault data in IndexedDB' },
  { pattern: /console\.(log|info|debug)\(.*(?:decrypted|plaintext|masterKey)/gi, reason: 'Sensitive data logged to console' },
  { pattern: /Sentry\.\w+\(.*(?:vault|decrypted|masterKey)/gi, reason: 'Vault data sent to error tracking' },
  { pattern: /analytics\.\w+\(.*(?:vault|decrypted)/gi, reason: 'Vault data in analytics' },
]

function scanFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const relativePath = filePath.replace(process.cwd(), '')

  for (const { pattern, reason } of LEAK_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      VIOLATIONS.push(`${relativePath}: ${reason}`)
    }
  }
}

function scanDir(dir: string): void {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) scanDir(fullPath)
    } else if (SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      scanFile(fullPath)
    }
  }
}

scanDir(process.cwd())

if (VIOLATIONS.length > 0) {
  console.error('❌ Vault data leak violations found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  // eslint-disable-next-line no-console
  console.log('✅ No vault data leaks detected')
}
