/**
 * check-routes-envelope.ts
 * Phase 01 — AH section requirement
 * Verifies that every API route handler uses withEnvelope and withIdempotency.
 * Run: pnpm tsx scripts/check-routes-envelope.ts
 */

import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const ROUTES_DIR = 'apps/web/src/app/api'
const VIOLATIONS: string[] = []

// Check if routes directory exists
let routeFiles: string[] = []
try {
  routeFiles = globSync(`${ROUTES_DIR}/**/route.ts`, { ignore: ['**/node_modules/**'] })
} catch {
  console.log('ℹ️  No API routes directory found — skipping (expected before web app is built)')
  process.exit(0)
}

if (routeFiles.length === 0) {
  console.log('ℹ️  No API route files found — skipping (expected before web app is built)')
  process.exit(0)
}

const MUTATION_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE']
const ENVELOPE_RE = /withEnvelope\s*\(/
const IDEMPOTENCY_RE = /withIdempotency\s*\(/

for (const file of routeFiles) {
  const content = readFileSync(file, 'utf-8')

  // Check each exported HTTP method handler
  for (const method of ['GET', ...MUTATION_METHODS]) {
    const methodRe = new RegExp(`export\\s+(?:const|async\\s+function)\\s+${method}\\b`)
    if (!methodRe.test(content)) continue

    if (!ENVELOPE_RE.test(content)) {
      VIOLATIONS.push(`${file}: ${method} handler missing withEnvelope()`)
    }

    if (MUTATION_METHODS.includes(method) && !IDEMPOTENCY_RE.test(content)) {
      VIOLATIONS.push(`${file}: ${method} handler missing withIdempotency()`)
    }
  }
}

if (VIOLATIONS.length > 0) {
  console.error('❌ Envelope/Idempotency violations:')
  VIOLATIONS.forEach((v) => console.error('  ', v))
  process.exit(1)
}

console.log(`✅ All ${routeFiles.length} API routes use withEnvelope + withIdempotency correctly`)
