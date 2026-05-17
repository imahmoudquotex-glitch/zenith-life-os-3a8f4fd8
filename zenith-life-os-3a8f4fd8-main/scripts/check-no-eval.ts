#!/usr/bin/env npx tsx
// CI Gate: check-no-eval.ts
// Scans for eval(), Function(), dynamic import in formula engine
// Reviewer issue #36: "no eval/Function/dynamic import"

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const BANNED_PATTERNS = [
  /\beval\s*\(/g,
  /\bnew\s+Function\s*\(/g,
  /\bimport\s*\(/g,  // dynamic import
  /\bsetTimeout\s*\(/g,  // no async escape
  /\bsetInterval\s*\(/g,
];

const SCAN_DIRS = [
  'src/lib/formula-engine',
  'src/lib/formula-functions',
  'packages/formula-engine',
];

let violations = 0;

function scan(dir: string) {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return; // dir doesn't exist yet
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      scan(fullPath);
    } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
      const content = readFileSync(fullPath, 'utf-8');
      for (const pattern of BANNED_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            console.error(`❌ ${relative('.', fullPath)}: found "${match.trim()}"`);
            violations++;
          }
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scan(dir);
}

if (violations > 0) {
  console.error(`\n❌ ${violations} violation(s) found. No eval/Function/dynamic import in formula engine.`);
  process.exit(1);
} else {
  console.log('✅ No eval/Function/dynamic import found in formula engine.');
}
