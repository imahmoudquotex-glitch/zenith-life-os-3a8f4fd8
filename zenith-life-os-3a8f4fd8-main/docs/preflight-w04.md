# Wave 04 Preflight Report

**Date:** 2026-05-17  
**Executor:** Google Antigravity

## Pre-flight Checks

| Check | Status | Notes |
|---|---|---|
| `w03-frozen` | ✅ | علامة التجميد موجودة |
| `pnpm install` | ✅ | All deps resolved |
| `pnpm typecheck` | ✅ | Zero errors |
| `pnpm build` | ✅ | Built in 4.36s |
| APP_URL HTTPS | ✅ | Configured in .env.local |
| Supabase keys | ✅ | NEXT_PUBLIC_SUPABASE_URL + ANON_KEY available |

## STUB MODE Features

The following optional features are running in STUB MODE due to missing keys:

| Feature | Status | Reason |
|---|---|---|
| Cloudflare Turnstile captcha | STUB | Keys not provided — captcha skipped |
| Apple OAuth | STUB | Service ID not provided |
| Resend email delivery | STUB | API key not provided — Supabase default email used |
| React Email preview | STUB | Deferred to W05 |
| pgTAP tests | STUB | DB testing environment not configured locally |
| axe-core CI gate | STUB | Deferred to W05 CI setup |
| Lighthouse CI | STUB | Deferred to W05 CI setup |
| Visual regression | STUB | Deferred to W05 CI setup |

## OAuth Providers (Active)

| Provider | Status |
|---|---|
| Google OAuth | ✅ Enabled in Supabase + Redirect URI in Google Console |
| GitHub OAuth | ✅ Enabled in Supabase |

## Handshake Notes

- Secrets stored in `.env.local` only
- No secrets in Notion or commits
- All optional missing items are documented above
