/**
 * Encryption Primitives Checker
 * Phase 00 Invariant: Forbidden primitives must never appear in codebase.
 * Scans all .ts, .tsx, .js, .sql files.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const FORBIDDEN = [
  { pattern: /createCipheriv\s*\(\s*['"`]aes-\d+-ecb['"`]/i, reason: 'Use AES-GCM or XChaCha20-Poly1305 instead' },
  { pattern: /createHash\s*\(\s*['"`]md5['"`]\s*\)/i, reason: 'MD5 is broken — use SHA-256 or BLAKE3' },
  { pattern: /createHash\s*\(\s*['"`]sha1['"`]\s*\)/i, reason: 'SHA1 is broken — use SHA-256 or BLAKE3' },
  { pattern: /\bMD5\b/gi, reason: 'MD5 algorithm string is forbidden' },
  { pattern: /\bSHA-?1\b/gi, reason: 'SHA1 algorithm string is forbidden' },
  { pattern: /\b3DES\b/gi, reason: 'Use AES-256 or XChaCha20-Poly1305' },
  { pattern: /\bRC4\b/gi, reason: 'RC4 is broken — use ChaCha20' },
  { pattern: /\bDES-CBC\b/gi, reason: 'Use AES-256-GCM' },
  { pattern: /Math\.random\(\)/g, reason: 'Use crypto.getRandomValues() for security-sensitive code' },
]

const SKIP_DIRS = ['node_modules', '.git', 'dist', '.next', 'coverage', 'docs']
const SKIP_FILES = [
  'invariants.ts',
  'check-encryption-primitives.ts', // defines forbidden list
  'check-naming.ts',                // references forbidden algos for naming validation
  'check-manifest.ts',              // documents invariants
] // allowlist: these MENTION forbidden strings for documentation/checking purposes
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.mjs']
const VIOLATIONS: string[] = []

function scanFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8')
  const relativePath = filePath.replace(process.cwd(), '')

  for (const { pattern, reason } of FORBIDDEN) {
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      VIOLATIONS.push(`${relativePath}: Contains forbidden pattern — ${reason}`)
    }
  }
}

function scanDir(dir: string): void {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) {
        scanDir(fullPath)
      }
    } else if (SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      if (!SKIP_FILES.includes(entry.name)) {
        scanFile(fullPath)
      }
    }
  }
}

// Run
scanDir(process.cwd())

if (VIOLATIONS.length > 0) {
  console.error('❌ Forbidden encryption primitives found:\n')
  for (const v of VIOLATIONS) {
    console.error(`  • ${v}`)
  }
  process.exit(1)
} else {
  console.log('✅ No forbidden encryption primitives found')
}
