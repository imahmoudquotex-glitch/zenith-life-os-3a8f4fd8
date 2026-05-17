// scripts/check-migrations.ts
// Reviewer issue #9, #10: Validates all SQL migrations follow conventions.
// Fails CI if:
// - UUID PRIMARY KEY on business tables
// - workspace_id UUID
// - SERIAL/BIGSERIAL usage
// - Missing ENABLE ROW LEVEL SECURITY
// - Missing FORCE ROW LEVEL SECURITY

import * as fs from 'node:fs';
import * as path from 'node:path';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '..', 'supabase', 'migrations');
const errors: string[] = [];

const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
  const upper = content.toUpperCase();

  // Skip extension/function-only migrations
  if (!upper.includes('CREATE TABLE')) continue;

  // Check for UUID PRIMARY KEY on business tables
  if (/id\s+UUID\s+PRIMARY\s+KEY/i.test(content)) {
    // Allow auth-related tables
    if (!file.includes('auth')) {
      errors.push(`${file}: UUID PRIMARY KEY found. Use TEXT + is_ulid() CHECK.`);
    }
  }

  // Check for workspace_id UUID
  if (/workspace_id\s+UUID/i.test(content)) {
    errors.push(`${file}: workspace_id UUID found. Use TEXT.`);
  }

  // Check for SERIAL/BIGSERIAL
  if (/\bSERIAL\b/i.test(content) || /\bBIGSERIAL\b/i.test(content)) {
    errors.push(`${file}: SERIAL/BIGSERIAL found. Use TEXT ULID.`);
  }

  // Check for ENABLE ROW LEVEL SECURITY
  if (upper.includes('CREATE TABLE') && !upper.includes('ENABLE ROW LEVEL SECURITY')) {
    errors.push(`${file}: Missing ENABLE ROW LEVEL SECURITY.`);
  }

  // Check for FORCE ROW LEVEL SECURITY
  if (upper.includes('CREATE TABLE') && !upper.includes('FORCE ROW LEVEL SECURITY')) {
    errors.push(`${file}: Missing FORCE ROW LEVEL SECURITY.`);
  }
}

if (errors.length > 0) {
  console.error('❌ Migration check FAILED:');
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log(`✅ Migration check passed (${String(files.length)} files)`);
}
