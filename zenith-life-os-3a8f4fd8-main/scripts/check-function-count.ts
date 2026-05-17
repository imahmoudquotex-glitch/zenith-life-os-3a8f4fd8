/**
 * CI Gate: check-function-count.ts
 * Verifies that the formula function registry has at least 40 functions.
 * Required by Definition of Done for Wave 08.
 */

import * as fs from 'fs';
import * as path from 'path';

const FUNC_DIR = path.resolve(__dirname, '..', 'src', 'lib', 'formula-functions');
const REGISTER_PATTERN = /registerFunction\s*\(\s*\{/g;
const MIN_FUNCTIONS = 40;

let totalCount = 0;
const categoryCounts: Record<string, number> = {};

for (const file of fs.readdirSync(FUNC_DIR)) {
  if (!file.endsWith('.ts') || file === 'registry.ts' || file === 'index.ts') continue;

  const content = fs.readFileSync(path.join(FUNC_DIR, file), 'utf-8');
  const matches = content.match(REGISTER_PATTERN);
  const count = matches ? matches.length : 0;
  categoryCounts[file] = count;
  totalCount += count;
}

process.stderr.write(`Formula function registry: ${totalCount} functions\n`);
for (const [file, count] of Object.entries(categoryCounts)) {
  process.stderr.write(`  ${file}: ${count}\n`);
}

if (totalCount < MIN_FUNCTIONS) {
  process.stderr.write(`❌ GATE FAILED: Need at least ${MIN_FUNCTIONS} functions, found ${totalCount}\n`);
  process.exit(1);
} else {
  process.stderr.write(`✅ Function count gate passed (${totalCount} >= ${MIN_FUNCTIONS})\n`);
}
