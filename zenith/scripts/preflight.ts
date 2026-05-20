import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let hasError = false;

walkDir(path.join(process.cwd(), 'apps'), (filepath) => {
  if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx')) return;
  const content = fs.readFileSync(filepath, 'utf8');

  // Check for direct AI provider imports
  if (content.includes("from 'openai'") || content.includes("from '@anthropic-ai/sdk'")) {
    console.error(`[ERROR] Direct AI provider import found in ${filepath}. Must use packages/ai/src/providers.`);
    hasError = true;
  }

  // Check for secrets in client bundles
  if (content.includes("'use client'") || content.includes('"use client"')) {
    if (content.includes('process.env.SUPABASE_SERVICE_ROLE_KEY') || content.includes('process.env.DATABASE_URL')) {
      console.error(`[ERROR] Secret found in client bundle: ${filepath}`);
      hasError = true;
    }
  }

  // Check for direct process.env usage outside env packages
  if (filepath.includes('packages/server-env') || filepath.includes('packages/client-env')) return;
  if (content.includes('process.env.')) {
    console.error(`[ERROR] Direct process.env usage in ${filepath}. Use env packages.`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('[OK] Preflight security checks passed.');
}
