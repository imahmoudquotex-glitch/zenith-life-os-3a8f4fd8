/**
 * CI Gate: No direct AI provider imports.
 * All AI usage MUST go through @zenith/ai gateway.
 */
import * as fs from 'fs';
import * as path from 'path';

const BANNED_PATTERNS = [
  /from\s+['"]openai['"]/,
  /from\s+['"]@anthropic-ai\/sdk['"]/,
  /require\s*\(\s*['"]openai['"]\s*\)/,
  /require\s*\(\s*['"]@anthropic-ai\/sdk['"]\s*\)/,
];

const SRC_DIR = path.resolve(process.cwd(), 'src');
const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');

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
  const files = [...scanDir(SRC_DIR), ...scanDir(PACKAGES_DIR)];
  const violations: string[] = [];

  for (const file of files) {
    // Skip the AI gateway package itself
    if (file.includes(path.join('packages', 'ai'))) continue;

    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${file}: Direct AI provider import detected (${pattern.source})`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('❌ Direct AI provider imports found:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ No direct AI provider imports found.');
}

main();
