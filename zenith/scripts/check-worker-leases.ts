import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('apps/worker/src/**/*.ts')
let hasErrors = false

// Handler files are lease-guarded by the Scheduler (apps/worker/src/scheduler.ts)
// which calls tryAcquireLease before dispatching to any handler.
// Only check top-level orchestration files — not individual handlers.
const HANDLER_FILES_PATTERN = /apps[\\/]worker[\\/]src[\\/]handlers[\\/]/

for (const file of files) {
  const normalizedPath = file.replace(/\\/g, '/')

  // Handler files are protected by the scheduler's lease guard — skip them
  if (HANDLER_FILES_PATTERN.test(normalizedPath)) continue

  const content = readFileSync(file, 'utf8')

  if (content.includes('Job') || content.includes('queue')) {
    if (!content.toLowerCase().includes('lease') && !content.toLowerCase().includes('lock')) {
      console.error(`❌ ${file} appears to process jobs but lacks lease/lock safeguards.`)
      hasErrors = true
    }
  }
}

if (hasErrors) process.exit(1)
console.log('✅ Worker leases checks passed')
