# Zenith Life OS

Privacy-first, AI-powered life OS. Arabic-first, dark-only, offline PWA.

## Stack
- **Framework:** Next.js 15 App Router + Server Actions + RSC
- **Database:** Supabase (PostgreSQL 15) + Row Level Security
- **Vault:** Zero-Knowledge Encryption (XChaCha20-Poly1305 + Argon2id)
- **AI:** Unified gateway with quota, PII redaction, audit
- **Offline:** IndexedDB outbox + Service Worker
- **Auth:** Supabase Auth + JWT verification

## Setup
`bash
cp .env.example .env.local
pnpm install
pnpm check:all
pnpm dev
`

## Wave System
- w00-frozen: Foundation
- w01-frozen: Workspaces + Auth
- w02-frozen: Database + Core Architecture
- w03-frozen: Security Fortress + Offline (current)

## CI
`bash
pnpm check:all   # 14+ static checks
pnpm typecheck   # TypeScript strict
pnpm lint        # ESLint zero warnings
`
