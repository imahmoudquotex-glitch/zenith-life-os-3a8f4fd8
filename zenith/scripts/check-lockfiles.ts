import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    if (f === 'node_modules' || f === '.git') return;
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let hasError = false;

walkDir(path.join(process.cwd()), (filepath) => {
  const basename = path.basename(filepath);
  if (basename === 'package-lock.json' || basename === 'yarn.lock') {
    console.error(`[ERROR] Forbidden lockfile found: ${filepath}`);
    hasError = true;
  }
});

if (hasError) {
  console.error('Only pnpm-lock.yaml is allowed. Run `pnpm install` at root.');
  process.exit(1);
} else {
  console.log('[OK] No forbidden lockfiles found.');
}
