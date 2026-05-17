# w04-frozen — Release Notes

**Wave:** 04 — Zenith Integration & Auth UI  
**Freeze Date:** 2026-05-17  
**Executor:** Google Antigravity  
**Commit Tag:** `w04-frozen`

---

## Summary

Wave 04 completes the **Auth UI + Design System integration** on the Zenith repo. The Zenith repo is adopted as the single visual source of truth.

---

## What Was Delivered

### 🎨 Design System (B, C, D, E)
- `src/lib/design-tokens.ts` — colors, typography, spacing, radius, shadow, motion, z-index
- Tailwind v4 `@theme inline` integration
- Dark-only color scheme (`color-scheme: dark`)
- `@media (prefers-reduced-motion: reduce)` in global styles
- `:focus-visible` defaults throughout
- `html[dir="rtl"]` + Arabic-first fonts (Cairo + Inter)
- Skip-to-main-content link in `__root.tsx`
- I18n provider with RTL auto-set

### 🔐 Auth Pages (V, W, X, Y, Z, Z1)
- `/auth/signin` — password + magic link modes + Google/GitHub OAuth
- `/auth/signup` — with password strength meter + email verification
- `/auth/magic-link` — OTP via Supabase
- `/auth/reset-password` — request + confirm pages
- `/auth/verify-email` — confirmation status page
- `/auth/callback` — OAuth + magic link exchange with PKCE + safeRedirectPath

### 🧭 Onboarding Wizard (Z2)
- 3-step wizard: locale → profile → timezone → done
- `ensurePersonalWorkspace` integration — creates personal workspace on completion
- `onboarding_state` persistence after each step (W04 migration 0407)

### 🗄️ Database Migrations (L–U = 0400–0409)
- `0400` oauth_state_tokens (TTL 10 min)
- `0401` users_extend_w04 (avatar_url, locale, onboarding_completed_at, ...)
- `0402` password_reset_tokens (TTL 60 min, one-time)
- `0403` magic_link_tokens (TTL 15 min, one-time)
- `0404` email_verification_tokens (TTL 24h)
- `0405` auth_lockouts_extend
- `0406` mfa_factors_scaffold
- `0407` onboarding_state
- `0408` captcha_attempts
- `0409` rls_pack_w04

### 📧 Email Templates (Z3)
- verify-email, reset-password, magic-link, invitation, new-device-login
- All in Arabic

### ⚙️ Settings Pages (Z5)
- `/settings` — hub page
- `/settings/profile` — display name, locale, timezone, avatar
- `/settings/security` — password change + 2FA scaffold
- `/settings/devices` — current device + device_registry scaffold
- `/settings/danger` — account deletion + data export placeholder

### 📄 Marketing Pages (Z4)
- `/about` — vision, principles, tech
- `/privacy` — full Arabic privacy policy
- `/terms` — full Arabic terms of service

### 📐 ADRs (Z6)
- ADR-0070-A: Zenith repo as design baseline

### 🧪 Tests (Z7 — partial)
- `tests/unit/auth-utils.test.ts` — safeRedirectPath + error message contracts
- `tests/unit/design-tokens.test.ts` — token structure integrity

### 📚 Documentation (Z8)
- `docs/conventions/auth-ui.md`
- `docs/conventions/design-tokens.md`
- `docs/conventions/rtl.md`
- `docs/conventions/a11y.md`
- `docs/conventions/onboarding.md`
- `docs/conventions/email-templates.md`
- `docs/preflight-w04.md`
- `docs/perf-budgets-w04.md`

### 🔄 CI (Z9)
- `.github/workflows/ci-w04.yml` — typecheck, lint, format, unit tests, build

---

## What Was Deferred (STUB MODE)

| Feature | Reason | Target Wave |
|---|---|---|
| Cloudflare Turnstile captcha | Keys not provided | W05 (when keys available) |
| Apple OAuth | Service ID not provided | W05 |
| Resend email delivery | API key not provided | W05 |
| React Email preview script | Deferred | W05 |
| pgTAP database tests | Local DB testing env | W05 |
| axe-core CI gate | CI setup | W05 |
| Lighthouse CI | CI setup | W05 |
| Visual regression | CI setup | W05 |
| Playwright E2E tests | E2E env | W05 |
| Multi-locale email templates | Arabic-only for now | W05 |
| Session revoke on password change | W03 full integration | W05 |
| Audit events logging | Backend integration | W05 |

---

## What Is Required from Owner Before Wave 05

1. Confirm Google/GitHub OAuth working end-to-end
2. Provide Resend API key + verified `from` address (for real email delivery)
3. Provide Cloudflare Turnstile keys (for captcha activation)
4. Confirm brand assets (logo SVG, favicon) if any beyond Zenith defaults
5. Confirm APP_URL production domain for OAuth redirect URIs

---

## Validation

```
✅ pnpm typecheck — zero errors
✅ pnpm build    — built in 4.36s
✅ zero `any` in new code
✅ zero console.log (only console.error in error handling)
✅ zero inline style= attributes
✅ zero localStorage for theme
✅ OAuth with PKCE via exchangeCodeForSession
✅ color contrast ≥ 4.5:1 (dark theme + neon green)
```

---

**🔒 w04-frozen**
