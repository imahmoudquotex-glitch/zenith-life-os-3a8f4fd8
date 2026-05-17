/**
 * CI Gate: No vault plaintext leak.
 * Ensures no code logs, console.logs, or passes vault data to AI without guard.
 */
import * as fs from 'fs';
import * as path from 'path';

const LEAK_PATTERNS = [
  /console\.(log|info|debug)\(.*vault/i,
  /console\.(log|info|debug)\(.*decrypt/i,
  /logger\.(info|debug)\(.*vault.*plaintext/i,
  /JSON\.stringify\(.*vaultItem/i,
];

const SRC_DIR = path.resolve(process.cwd(), 'src');

function scanDir(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(path.join(entry.parentPath || (entry as any).path, entry.name));
    }
  }
  return files;
}

function main() {
  const files = scanDir(SRC_DIR);
  const violations: string[] = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      for (const pattern of LEAK_PATTERNS) {
        if (pattern.test(line)) {
          violations.push(`${file}:${idx + 1}: ${line.trim()}`);
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error('❌ Vault plaintext leak detected:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ No vault plaintext leaks found.');
}

main();
