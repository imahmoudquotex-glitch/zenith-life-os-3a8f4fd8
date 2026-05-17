# Email Templates — Wave 04 Conventions

## Overview

Email templates are defined in `src/lib/email/templates.ts` as plain HTML strings (React Email deferred to W05).

All templates are in Arabic by default.

## Templates

| Template | Function | Trigger |
|---|---|---|
| `verifyEmailTemplate` | Email verification | After signup |
| `resetPasswordTemplate` | Password reset | Reset request |
| `magicLinkTemplate` | Magic link login | Magic link request |
| `invitationTemplate` | Workspace invitation | W01 invite flow |
| `newDeviceLoginTemplate` | New device alert | Login from new device |

## Rules

- ✅ HTML + plaintext fallback
- ✅ RTL compatible (most email clients ignore `dir` but layout works)
- ✅ Dark background with light text (email-client safe)
- ❌ No pixel tracking without user consent (GDPR/PDPL)
- ❌ No secrets or full tokens in image `alt` text
- ❌ No `<img src="tracker.gif">` style pixels

## Usage (via Supabase)

Templates are passed to Supabase auth settings or triggered via server-side functions.

```ts
import { verifyEmailTemplate } from '@/lib/email/templates'

// Used in Supabase custom email hook
const html = verifyEmailTemplate({ link: confirmUrl, appUrl: APP_URL })
```

## Localization

Currently Arabic-only. Multi-locale (ar/en) deferred to W05.
