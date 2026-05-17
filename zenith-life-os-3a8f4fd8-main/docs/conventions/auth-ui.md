# Auth UI Conventions — Wave 04

## Overview

Auth pages are built with the Zenith dark-neon visual language. Every component is a wrapper over the existing Zenith primitives.

## Auth State Machine

```ts
type AuthState =
  | { step: 'idle' }
  | { step: 'submitting' }
  | { step: 'needs_email_verification'; emailMasked: string }
  | { step: 'needs_2fa'; challengeId: string }
  | { step: 'locked'; retryAfterSeconds: number }
  | { step: 'success'; redirectTo: string }
  | { step: 'error'; code: 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'UNKNOWN' }
```

## Security Contracts

| Contract | Implementation |
|---|---|
| Error messages | Never reveal user existence. Use generic: "البريد أو كلمة المرور غير صحيحة" |
| Lockout | 5 failed attempts → 30-minute lockout (W03 rate_limit_lockouts) |
| Session rotation | Called after every successful signin via Supabase |
| OAuth PKCE | Supabase handles PKCE automatically via `exchangeCodeForSession` |
| Open redirect | `safeRedirectPath()` in `src/lib/auth/actions.ts` |
| CSRF | Supabase JWT + same-origin checks |

## Pages

| Route | Component | Notes |
|---|---|---|
| `/auth/signin` | `SignInForm.tsx` | password + magic link mode |
| `/auth/signup` | `SignUpForm.tsx` | with password strength meter |
| `/auth/magic-link` | `MagicLinkForm.tsx` | OTP via Supabase |
| `/auth/reset-password` | `ResetPasswordForm.tsx` | request page |
| `/auth/reset-password/confirm` | `ConfirmResetPasswordForm.tsx` | confirm page |
| `/auth/verify-email` | `verify-email.tsx` | email confirmation status |
| `/auth/callback` | `callback.tsx` | OAuth + magic link exchange |

## Password Requirements

- Minimum 8 characters
- Strength meter: weak / fair / good / strong / excellent
- `autoComplete="new-password"` on signup, `autoComplete="current-password"` on signin

## RTL

All auth forms use `dir="rtl"` via the root HTML element. Input fields that contain emails or passwords use `dir="ltr"` locally for correct display.

## Anti-patterns

- ❌ Never `console.log` passwords
- ❌ Never reveal if email is registered in error messages
- ❌ Never store auth tokens in localStorage
- ❌ Never use `style=` inline in auth components
