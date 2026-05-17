/**
 * CI Gate: check-no-uuid-columns.ts
 * Scans migration files for UUID column types.
 * All IDs must be TEXT with ULID validation per ADR-0004.
 */

import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'supabase', 'migrations');
const UUID_PATTERNS = [
  /\bUUID\b/gi,
  /\bgen_random_uuid\s*\(\)/gi,
  /\buuid_generate_v4\s*\(\)/gi,
];

// Exceptions: extensions migration is allowed to reference UUID extension
const ALLOWED_FILES = ['0001_extensions.sql'];

const violations: string[] = [];

if (fs.existsSync(MIGRATIONS_DIR)) {
  for (const file of fs.readdirSync(MIGRATIONS_DIR)) {
    if (!file.endsWith('.sql')) continue;
    if (ALLOWED_FILES.includes(file)) continue;

    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    
    for (const pattern of UUID_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const line = content.substring(0, match.index).split('\n').length;
        violations.push(`${file}:${line}: ${match[0]}`);
      }
    }
  }
}

if (violations.length > 0) {
  process.stderr.write('❌ SECURITY GATE FAILED: UUID columns detected in migrations\n');
  process.stderr.write('   All IDs must be TEXT with ULID validation (ADR-0004)\n');
  violations.forEach(v => process.stderr.write(`  ${v}\n`));
  process.exit(1);
} else {
  process.stderr.write('✅ No UUID column violations found\n');
}
