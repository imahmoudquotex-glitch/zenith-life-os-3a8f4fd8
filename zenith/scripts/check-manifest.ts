/**
 * check:manifest — verifies that every invariant in docs/MANIFEST.md
 * has a corresponding check:* script defined in zenith/package.json.
 *
 * Exits 0 = all invariants covered.
 * Exits 1 = missing script(s) found.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd(), '..');
const MANIFEST_PATH = resolve(ROOT, 'docs/MANIFEST.md');
const PKG_PATH = resolve(process.cwd(), 'package.json');

// ── Parse MANIFEST for required scripts ──────────────────────────────────────
const manifest = readFileSync(MANIFEST_PATH, 'utf-8');
const requiredScripts = new Set<string>();
const scriptMatches = manifest.matchAll(/CHECK_SCRIPT:\s*(check:\S+)/g);
for (const m of scriptMatches) {
  requiredScripts.add(m[1]!);
}

// ── Parse package.json for defined scripts ────────────────────────────────────
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8')) as { scripts: Record<string, string> };
const definedScripts = new Set(Object.keys(pkg.scripts ?? {}));

// ── Cross-check ───────────────────────────────────────────────────────────────
const missing: string[] = [];
for (const required of requiredScripts) {
  if (!definedScripts.has(required)) {
    missing.push(required);
  }
}

// ── Also verify each check:* has a TS file ────────────────────────────────────
import { existsSync } from 'fs';

const CHECK_SCRIPT_MAP: Record<string, string> = {
  'check:crypto':                 'scripts/check-encryption-primitives.ts',
  'check:vault-leak':             'scripts/check-no-vault-leak.ts',
  'check:vapid-key-not-in-client':'scripts/check-vapid-key-not-in-client.ts',
  'check:tenants':                'scripts/check-tenant-boundaries.ts',
  'check:rls':                    'scripts/check-rls.ts',
  'check:no-sql-in-routes':       'scripts/check-no-sql-in-routes.ts',
  'check:money':                  'scripts/check-money-columns.ts',
  'check:audit-events':           'scripts/check-audit-events.ts',
  'check:audit-merkle':           'scripts/verify-audit-chain.ts',
  'check:idempotency':            'scripts/check-idempotency.ts',
  'check:naming':                 'scripts/check-naming.ts',
  'check:migrations':             'scripts/check-migrations.ts',
  'check:dark-only-tokens':       'scripts/check-dark-only-tokens.ts',
  'check:no-ai-in-render':        'scripts/check-no-ai-in-render.ts',
  'check:timezone-hardcode':      'scripts/check-timezone-hardcode.ts',
  'check:routes-envelope':        'scripts/check-routes-envelope.ts',
  'check:worker-leases':          'scripts/check-worker-leases.ts',
  'check:sw-audit':               'scripts/check-sw-audit.ts',
  'check:manifest':               'scripts/check-manifest.ts',
};

const missingFiles: string[] = [];
for (const [script, file] of Object.entries(CHECK_SCRIPT_MAP)) {
  const fullPath = resolve(process.cwd(), file);
  if (!existsSync(fullPath)) {
    missingFiles.push(`${script} → ${file}`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log('\n🔍 Manifest Invariant Check\n');
console.log(`  Invariants in MANIFEST.md : ${requiredScripts.size}`);
console.log(`  Scripts in package.json   : ${definedScripts.size}`);
console.log(`  Script files verified     : ${Object.keys(CHECK_SCRIPT_MAP).length - missingFiles.length}/${Object.keys(CHECK_SCRIPT_MAP).length}`);

if (missing.length > 0) {
  console.error('\n❌ Missing scripts in package.json:');
  for (const s of missing) console.error(`   - ${s}`);
}

if (missingFiles.length > 0) {
  console.error('\n❌ Missing script TS files:');
  for (const s of missingFiles) console.error(`   - ${s}`);
}

if (missing.length === 0 && missingFiles.length === 0) {
  console.log('\n✅ All manifest invariants are covered by check scripts!\n');
  process.exit(0);
} else {
  console.error(`\n❌ Manifest check FAILED: ${missing.length + missingFiles.length} issue(s)\n`);
  process.exit(1);
}
