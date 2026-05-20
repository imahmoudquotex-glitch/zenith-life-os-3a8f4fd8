import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'packages', 'db', 'migrations');

function checkDestructiveDdl() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
  let hasError = false;

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    if (/DROP\s+(TABLE|COLUMN)/i.test(content) && !content.includes('ADR-')) {
      console.error(`[ERROR] Destructive DDL found in ${file} without ADR reference.`);
      hasError = true;
    }
    if (/RENAME\s+COLUMN/i.test(content) && !content.includes('ADR-')) {
      console.error(`[ERROR] RENAME COLUMN found in ${file} without ADR reference.`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('[OK] No destructive DDL found without ADR reference.');
  }
}

checkDestructiveDdl();
