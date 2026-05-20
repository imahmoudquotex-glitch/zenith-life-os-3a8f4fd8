#!/usr/bin/env tsx
/**
 * check:vapid-key-not-in-client
 * VAPID private key must NEVER appear in client-side bundles.
 */

import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';

const CLIENT_FILES = await glob(
  ['{apps,packages}/**/*.{ts,tsx}'],
  {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    absolute: true,
  },
);

const errors: string[] = [];

for (const file of CLIENT_FILES) {
  const relative = path.relative(process.cwd(), file);
  const text = await fs.readFile(file, 'utf8');

  // Skip server-only files
  if (text.includes("'use server'") || text.includes('import \'server-only\'')) continue;

  // Client files must not reference VAPID_PRIVATE_KEY
  if (text.includes("'use client'") || text.includes('"use client"')) {
    if (text.includes('VAPID_PRIVATE_KEY') || text.includes('vapidPrivateKey')) {
      const lineNum = text.split('\n').findIndex((l) => l.includes('VAPID_PRIVATE_KEY') || l.includes('vapidPrivateKey')) + 1;
      errors.push(`  ${relative}:${lineNum} — VAPID_PRIVATE_KEY in client component`);
    }
    if (text.includes('SUPABASE_SERVICE_ROLE_KEY') || text.includes('serviceRoleKey')) {
      const lineNum = text.split('\n').findIndex((l) => l.includes('SUPABASE_SERVICE_ROLE_KEY')) + 1;
      errors.push(`  ${relative}:${lineNum} — SUPABASE_SERVICE_ROLE_KEY in client component`);
    }
  }
}

if (errors.length > 0) {
  console.error(`❌ Secret keys found in client components:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log('✅ VAPID/secret key client check passed');
