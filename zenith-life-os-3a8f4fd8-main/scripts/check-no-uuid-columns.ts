#!/usr/bin/env npx tsx
// CI Gate: check-no-uuid-columns.ts
// Scans ALL migrations for UUID PRIMARY KEY / UUID NOT NULL columns
// Only auth_uid mapping is allowed as UUID (since Supabase auth uses UUIDs)

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const MIGRATIONS_DIR = 'supabase/migrations';
const UUID_PK_PATTERN = /UUID\s+(PRIMARY\s+KEY|NOT\s+NULL)/gi;
const UUID_DEFAULT_PATTERN = /DEFAULT\s+gen_random_uuid\(\)/gi;

// Allowed exceptions
const ALLOWED_FILES = ['0010_users.sql']; // auth_uid is UUID by design
const ALLOWED_PATTERNS = [/auth_uid/i];

let violations = 0;

const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));

for (const file of files) {
  if (ALLOWED_FILES.includes(file)) continue;

  const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isAllowed = ALLOWED_PATTERNS.some(p => p.test(line));
    if (isAllowed) continue;

    if (UUID_PK_PATTERN.test(line) || UUID_DEFAULT_PATTERN.test(line)) {
      console.error(`❌ ${file}:${i + 1}: UUID column found — use TEXT with is_ulid() CHECK`);
      violations++;
    }
    // Reset lastIndex for global regex
    UUID_PK_PATTERN.lastIndex = 0;
    UUID_DEFAULT_PATTERN.lastIndex = 0;
  }
}

if (violations > 0) {
  console.error(`\n❌ ${violations} UUID column(s) found in migrations. Use TEXT + is_ulid().`);
  process.exit(1);
} else {
  console.log('✅ No UUID columns in business table migrations.');
}
