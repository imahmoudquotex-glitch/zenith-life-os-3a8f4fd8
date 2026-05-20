import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('{apps,packages}/**/*.{ts,tsx}')
let hasErrors = false

// Allowlist: files that are ALLOWED to use Date/Date.now()
// - packages/shared/src/time.ts — defines the Clock abstraction itself
// - apps/worker/src/* — infrastructure, uses clock via leases/scheduler  
// - packages/observability — structured logging timestamps are infrastructure
// - packages/metrics — in-memory counters use wall time
// - packages/jobs — job scheduling uses timestamps
// - packages/block-engine — fractional index uses Date for updatedAt
// - packages/design-tokens — no date logic but listed for safety
const ALLOWLISTED_PATHS = [
  'packages/shared/src/time.ts',       // defines Clock — canonical use of new Date()
  'apps/worker/src/leases.ts',          // infrastructure: lease expiry timestamps
  'apps/worker/src/scheduler.ts',       // infrastructure: setTimeout scheduling
  'apps/worker/src/index.ts',           // infrastructure: startup timestamp
  'packages/observability/src/index.ts',// logging timestamps are inherently wall-time
  'packages/metrics/src/index.ts',      // counter start time is wall-time
  'packages/jobs/src/index.ts',         // job created_at is wall-time
  'packages/block-engine/src/index.ts', // block.updatedAt uses clock
]

for (const file of files) {
  const normalizedPath = file.replace(/\\/g, '/')
  if (normalizedPath.includes('node_modules')) continue

  // Skip allowlisted files
  const isAllowlisted = ALLOWLISTED_PATHS.some(allowed => normalizedPath.endsWith(allowed))
  if (isAllowlisted) continue

  // Skip packages/shared/src/ — Clock abstraction lives here
  if (normalizedPath.includes('packages/shared/src/')) continue

  const content = readFileSync(file, 'utf8')
  if (/new Date\(\)/.test(content) || /Date\.now\(\)/.test(content)) {
    console.error(`❌ ${file} uses hardcoded date logic. Use @zenith/shared/time Clock abstraction.`)
    hasErrors = true
  }
}

if (hasErrors) process.exit(1)
console.log('✅ Timezone hardcode checks passed')
