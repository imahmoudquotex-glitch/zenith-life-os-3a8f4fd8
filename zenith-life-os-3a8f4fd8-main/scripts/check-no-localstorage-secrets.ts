// scripts/check-no-localstorage-secrets.ts
// Reviewer issue #15: No auth tokens or secrets in localStorage

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCAN_DIRS = ['apps', 'packages'].map(d => path.join(ROOT, d));
const PATTERNS = [
  /localStorage\.setItem\s*\(\s*['"].*(?:token|secret|key|password|session|auth)/gi,
  /localStorage\.getItem\s*\(\s*['"].*(?:token|secret|key|password|session|auth)/gi,
  /sessionStorage\.setItem\s*\(\s*['"].*(?:token|secret|key|password|auth)/gi,
];
const errors: string[] = [];

function scanDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const pattern of PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(content)) {
          errors.push(`${path.relative(ROOT, fullPath)}: Secrets in localStorage/sessionStorage`);
          break;
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

if (errors.length > 0) {
  console.error('❌ localStorage secrets check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log('✅ No localStorage secret patterns found');
}
