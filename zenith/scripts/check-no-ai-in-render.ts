import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('apps/web/app/**/{page,layout,component}.tsx')
let hasErrors = false

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  if (/runAIWithQuota/.test(content) || /@zenith\/ai/.test(content)) {
    console.error(`❌ ${file} calls AI in render path. Move AI calls to Server Actions or API routes.`)
    hasErrors = true
  }
}

if (hasErrors) process.exit(1)
console.log('✅ No AI in render path passed')
