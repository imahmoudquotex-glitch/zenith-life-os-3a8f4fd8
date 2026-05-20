/**
 * check-audit-events.ts
 * Phase 01 — AG section requirement
 * Verifies that every service mutation has a corresponding auditWriter.write() call.
 * Run: pnpm tsx scripts/check-audit-events.ts
 */

import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const SERVICE_DIRS = ['packages/workspaces/src', 'packages/pages/src', 'packages/permissions/src', 'packages/auth/src']
const AUDIT_CALL = /auditWriter\.write\s*\(/

const VIOLATIONS: string[] = []

for (const dir of SERVICE_DIRS) {
  const files = globSync(`${dir}/**/*.ts`, { ignore: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'] })
  for (const file of files) {
    const content = readFileSync(file, 'utf-8')

    // Find all exported async functions that contain DB write operations
    const fnRegex = /export\s+async\s+function\s+(\w+)/g
    let match: RegExpExecArray | null

    while ((match = fnRegex.exec(content)) !== null) {
      const fnName = match[1]!
      // Find the function body (simplified: look for mutations)
      const fromIdx = match.index
      const nextFnIdx = content.indexOf('\nexport async function', fromIdx + 1)
      const fnBody = content.slice(fromIdx, nextFnIdx === -1 ? undefined : nextFnIdx)

      const hasDbWrite = /\bdb\.(query|none|one|oneOrNone|many|tx)\b/.test(fnBody) &&
        /\b(INSERT|UPDATE|DELETE)\b/i.test(fnBody)
      const hasAudit = AUDIT_CALL.test(fnBody)
      const isReadOnly = /\b(get|list|find|read|select|fetch|count)\b/i.test(fnName)

      if (hasDbWrite && !hasAudit && !isReadOnly) {
        VIOLATIONS.push(`${file}: function "${fnName}" has DB writes but no auditWriter.write() call`)
      }
    }
  }
}

if (VIOLATIONS.length > 0) {
  console.error('❌ Audit coverage violations:')
  VIOLATIONS.forEach((v) => console.error('  ', v))
  process.exit(1)
}

console.log('✅ All service mutations have audit events')
