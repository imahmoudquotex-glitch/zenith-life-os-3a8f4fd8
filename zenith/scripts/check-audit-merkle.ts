#!/usr/bin/env tsx
/**
 * check:audit-merkle  (alias for verify-audit-chain.ts)
 * Verifies the Merkle chain of audit events in test mode.
 * In CI: runs against a local Supabase instance.
 */

import { execSync } from 'node:child_process';

// verify-audit-chain.ts already exists — just run it
try {
  execSync('tsx scripts/verify-audit-chain.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch {
  process.exit(1);
}
