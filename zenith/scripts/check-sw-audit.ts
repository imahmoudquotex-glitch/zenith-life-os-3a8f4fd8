#!/usr/bin/env tsx
/**
 * check:sw-audit
 * Service Worker must not contain eval, new Function, or dynamic code.
 * Also checks that NetworkOnly deny-list covers all sensitive paths.
 */

import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';

const FORBIDDEN_IN_SW = [
  { pattern: /\beval\s*\(/, label: 'eval()' },
  { pattern: /new\s+Function\s*\(/, label: 'new Function()' },
  { pattern: /importScripts\s*\(/, label: 'importScripts()' },
  { pattern: /innerHTML\s*=/, label: 'innerHTML assignment' },
];

const REQUIRED_DENY_PATHS = [
  '/api/',
  '/auth/',
  '/vault/',
  '/api/ai/',
  '/api/billing/',
  '/api/webhooks/',
  '/api/csrf',
  '/api/csp-report',
  '/api/push/',
];

const SW_FILES = await glob(
  ['packages/sw/src/**/*.ts', 'packages/sw/src/**/*.js', 'apps/web/public/sw.js'],
  { ignore: ['**/node_modules/**', '**/dist/**'], absolute: true },
);

const errors: string[] = [];

for (const file of SW_FILES) {
  const relative = path.relative(process.cwd(), file);
  const text = await fs.readFile(file, 'utf8');
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    for (const { pattern, label } of FORBIDDEN_IN_SW) {
      if (pattern.test(line)) {
        errors.push(`  ${relative}:${i + 1} — forbidden: ${label}`);
      }
    }
  }

  // Check deny-list coverage in SW files
  const swContent = text;
  if (swContent.includes('NetworkOnly') || swContent.includes('networkOnly') || swContent.includes('DENY_LIST')) {
    for (const denyPath of REQUIRED_DENY_PATHS) {
      if (!swContent.includes(denyPath)) {
        errors.push(`  ${relative} — missing NetworkOnly deny path: ${denyPath}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`❌ Service Worker audit failed:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log('✅ Service Worker audit passed');
