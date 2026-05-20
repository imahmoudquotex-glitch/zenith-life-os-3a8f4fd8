import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

const files = globSync('apps/web/app/api/**/route.ts')
let hasErrors = false

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  if (/import.*(?:pg|postgres|mysql)/i.test(content) || /sql`/.test(content)) {
    console.error(`❌ ${file} imports or uses direct SQL. Move to @zenith/db.`)
    hasErrors = true
  }
}

if (hasErrors) process.exit(1)
console.log('✅ No SQL in routes passed')
