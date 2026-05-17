// scripts/check-no-ai-direct-import.ts
// Reviewer issue #31: No direct AI provider imports outside packages/ai

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANNED_IMPORTS = ['openai', '@anthropic-ai/sdk', 'ai'];
const ALLOWED_DIR = path.join(ROOT, 'packages', 'ai');
const SCAN_DIRS = ['apps', 'packages'].map(d => path.join(ROOT, d));
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
      // Skip packages/ai itself
      if (fullPath.startsWith(ALLOWED_DIR)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const banned of BANNED_IMPORTS) {
        const pattern = new RegExp(`from\\s+['"]${banned}['"]|require\\(['"]${banned}['"]\\)`, 'g');
        if (pattern.test(content)) {
          errors.push(`${path.relative(ROOT, fullPath)}: Direct import of "${banned}". Use @zenith/ai gateway.`);
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

if (errors.length > 0) {
  console.error('❌ AI import check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log('✅ No direct AI provider imports found');
}
