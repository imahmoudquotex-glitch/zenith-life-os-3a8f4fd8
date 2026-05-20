import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('apps/worker/src/**/*.ts')
let hasErrors = false

for (const file of files) {
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
