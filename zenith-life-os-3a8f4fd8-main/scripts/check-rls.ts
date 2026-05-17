// scripts/check-rls.ts
// Reviewer issue #11, #13: Validates RLS policies are workspace-based.
// Fails if USING (true) is found without explicit ALLOW comment.

import * as fs from 'node:fs';
import * as path from 'node:path';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '..', 'supabase', 'migrations');
const errors: string[] = [];

const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Check for USING (true) without ALLOW comment
    if (/USING\s*\(\s*true\s*\)/i.test(line)) {
      const prevLine = i > 0 ? lines[i - 1]! : '';
      if (!prevLine.includes('-- ALLOW:')) {
        errors.push(`${file}:${String(i + 1)}: USING (true) without -- ALLOW: comment`);
      }
    }

    // Check for WITH CHECK (true) without ALLOW comment
    if (/WITH\s+CHECK\s*\(\s*true\s*\)/i.test(line)) {
      const prevLine = i > 0 ? lines[i - 1]! : '';
      if (!prevLine.includes('-- ALLOW:')) {
        errors.push(`${file}:${String(i + 1)}: WITH CHECK (true) without -- ALLOW: comment`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('❌ RLS check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log(`✅ RLS check passed (${String(files.length)} files)`);
}
