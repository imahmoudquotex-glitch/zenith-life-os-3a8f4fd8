#!/usr/bin/env tsx
/**
 * check:dark-only-tokens
 * Ensures no light theme color tokens are used in the codebase.
 * Rejects: bg-white, bg-gray-50, bg-slate-100, text-black, text-gray-900, etc.
 * Allowed: dark: prefix classes + CSS variables only
 */

import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';

const LIGHT_PATTERNS = [
  /\bbg-white\b/,
  /\bbg-gray-\d+\b(?!.*dark:)/,
  /\bbg-slate-\d+\b(?!.*dark:)/,
  /\bbg-zinc-\d+\b(?!.*dark:)/,
  /\btext-black\b/,
  /\btext-gray-\d+\b(?!.*dark:)/,
  /\btext-slate-\d+\b(?!.*dark:)/,
  /\bborder-gray-\d+\b(?!.*dark:)/,
  /background:\s*#(?:fff|FFF|ffffff|FFFFFF)/,
  /background:\s*white\b/,
  /color:\s*#(?:000|000000)\b/,
  /color:\s*black\b/,
];

// Files to exclude from the check
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/tailwind.config.*',
  '**/check-dark-only-tokens.ts',
];

const files = await glob(
  ['{apps,packages}/**/*.{ts,tsx,css}'],
  { ignore: EXCLUDE_PATTERNS, absolute: true },
);

const errors: string[] = [];

for (const file of files) {
  const relative = path.relative(process.cwd(), file);
  const text = await fs.readFile(file, 'utf8');
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Skip comments and dark: prefixed lines
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue;
    for (const pattern of LIGHT_PATTERNS) {
      if (pattern.test(line)) {
        errors.push(`  ${relative}:${i + 1} — "${line.trim().slice(0, 80)}"`);
        break;
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`❌ Light theme tokens found (dark-only mode enforced):\n${errors.join('\n')}`);
  process.exit(1);
}

console.log('✅ Dark-only tokens check passed');
