// scripts/check-naming.ts
// Reviewer issue #14: Consistent table naming (users_workspaces not workspace_members)

import * as fs from 'node:fs';
import * as path from 'node:path';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '..', 'supabase', 'migrations');
const BANNED_NAMES = ['workspace_members'];
const errors: string[] = [];

const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

  for (const banned of BANNED_NAMES) {
    if (content.includes(banned)) {
      errors.push(`${file}: Contains banned name "${banned}". Use "users_workspaces" instead.`);
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Naming check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log(`✅ Naming check passed (${String(files.length)} files)`);
}
