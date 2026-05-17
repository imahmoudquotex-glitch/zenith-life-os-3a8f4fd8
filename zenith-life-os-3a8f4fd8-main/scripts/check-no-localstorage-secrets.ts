/**
 * CI Gate: No localStorage secrets.
 * Ensures no code stores tokens, passwords, or keys in localStorage/sessionStorage.
 */
import * as fs from 'fs';
import * as path from 'path';

const LEAK_PATTERNS = [
  /localStorage\s*\.setItem\s*\(\s*['"].*token/i,
  /localStorage\s*\.setItem\s*\(\s*['"].*secret/i,
  /localStorage\s*\.setItem\s*\(\s*['"].*password/i,
  /localStorage\s*\.setItem\s*\(\s*['"].*apiKey/i,
  /localStorage\s*\.setItem\s*\(\s*['"].*key/i,
  /sessionStorage\s*\.setItem\s*\(\s*['"].*token/i,
  /sessionStorage\s*\.setItem\s*\(\s*['"].*secret/i,
  /window\.localStorage/,
  /window\.sessionStorage/,
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
    console.error('❌ localStorage/sessionStorage secret storage detected:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ No localStorage secrets found.');
}

main();
