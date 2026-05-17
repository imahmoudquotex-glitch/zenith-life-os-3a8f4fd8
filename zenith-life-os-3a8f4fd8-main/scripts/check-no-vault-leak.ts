// scripts/check-no-vault-leak.ts
// Reviewer issue #32: Vault plaintext must never reach AI or logs

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCAN_DIRS = ['apps', 'packages'].map(d => path.join(ROOT, d));
const VAULT_PATTERNS = [
  /vault\.decrypt/g,
  /vault\.plaintext/g,
  /console\.\w+\(.*vault/gi,
  /console\.\w+\(.*secret/gi,
  /console\.\w+\(.*password/gi,
  /console\.\w+\(.*token/gi,
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
      for (const pattern of VAULT_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(content)) {
          errors.push(`${path.relative(ROOT, fullPath)}: Potential vault/secret leak pattern found`);
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
  console.error('❌ Vault leak check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log('✅ No vault/secret leak patterns found');
}
