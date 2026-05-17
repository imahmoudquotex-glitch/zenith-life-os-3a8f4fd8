/**
 * CI Gate: check-no-eval.ts
 * Scans source files for eval(), new Function(), and dynamic imports.
 * Exits with code 1 if any are found.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const PATTERNS = [
  /\beval\s*\(/g,
  /\bnew\s+Function\s*\(/g,
  /\bFunction\s*\.\s*constructor/g,
  /import\s*\(/g,  // dynamic import
];

const ALLOWED_DYNAMIC_IMPORTS = [
  'src/server.ts',  // Middleware lazy loading is acceptable
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.next', '.turbo'];

function scanDir(dir: string): string[] {
  const violations: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue;
      violations.push(...scanDir(fullPath));
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');

      for (const pattern of PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          // Allow dynamic imports in server.ts for middleware
          if (pattern.source.includes('import') && ALLOWED_DYNAMIC_IMPORTS.some(p => relativePath.includes(p))) {
            continue;
          }
          const line = content.substring(0, match.index).split('\n').length;
          violations.push(`${relativePath}:${line}: ${match[0].trim()}`);
        }
      }
    }
  }

  return violations;
}

const violations = scanDir(ROOT);

if (violations.length > 0) {
  process.stderr.write('❌ SECURITY GATE FAILED: eval/Function/dynamic-import detected\n');
  violations.forEach(v => process.stderr.write(`  ${v}\n`));
  process.exit(1);
} else {
  process.stderr.write('✅ No eval/Function/dynamic-import violations found\n');
}
