import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('{apps,packages}/**/*.{ts,tsx}')
let hasErrors = false

for (const file of files) {
  const normalizedPath = file.replace(/\\/g, '/')
  if (normalizedPath.includes('packages/shared/src/') || normalizedPath.includes('node_modules')) continue
  
  const content = readFileSync(file, 'utf8')
  if (/new Date\(\)/.test(content) || /Date\.now\(\)/.test(content)) {
    console.error(`❌ ${file} uses hardcoded date logic. Use @zenith/shared/time Clock abstraction.`)
    hasErrors = true
  }
}

if (hasErrors) process.exit(1)
console.log('✅ Timezone hardcode checks passed')
