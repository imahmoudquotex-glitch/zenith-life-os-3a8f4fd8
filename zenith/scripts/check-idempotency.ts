import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('apps/web/app/api/**/route.ts')

let hasErrors = false

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  
  // Check POST/PUT/PATCH/DELETE methods
  const hasMutatingMethod = /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/.test(content)
  
  if (hasMutatingMethod) {
    const hasIdempotencyHeaderCheck = /Idempotency-Key/.test(content) || /requireIdempotency/.test(content)
    if (!hasIdempotencyHeaderCheck) {
      console.error(`❌ ${file} missing Idempotency-Key check or middleware`)
      hasErrors = true
    }
  }
}

if (hasErrors) {
  process.exit(1)
}

console.log('✅ Idempotency checks passed')
