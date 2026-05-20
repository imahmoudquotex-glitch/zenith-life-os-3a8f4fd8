# 🚦 Preflight Checklist — Wave 01

> **تاريخ:** 2026-05-16
> **الغرض:** توثيق نتائج فحص بيئة Wave 01 قبل التنفيذ.
> **المرجع:** `مرحله_02.md` → القسم 2.1

## Pre-flight Checks نتائج

| الفحص | النتيجة |
|-------|---------|
| `git tag --list \| grep w00-frozen` | ✅ `w00-frozen` موجود |
| `pnpm install --frozen-lockfile` | ✅ نجح |
| `pnpm typecheck` | ✅ أخضر — جميع الحزم نظيفة |
| `pnpm lint` | ✅ أخضر |
| `scripts/check-migrations.ts` | ✅ آخر migration = 0110 |
| `scripts/check-rls.ts` | ✅ أخضر |

## Required Inputs Status

| المطلوب | الحالة |
|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ في `.env.local` (غير موثّق هنا لأسباب أمنية) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ في `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ في `.env.local` — server-only |
| `DATABASE_URL` | ⚠️ في `.env.local` — server-only |
| `APP_URL` | ⚠️ في `.env.local` |

> ⚠️ **تنبيه:** القيم السرية ممنوع توثيقها هنا. `.env.example` يحتوي الأسماء فقط.

## Redirect URLs (Supabase Auth Settings)

الـ URLs دي لازم تتضاف في Supabase Auth Redirect URLs:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/invite/*`
- `{APP_URL}/auth/callback` (production)
- `{APP_URL}/invite/*` (production)

## Scope Reminder

Wave 01 = Kernel فقط:
- ✅ Auth (Supabase) + Users
- ✅ Workspaces + Membership + Invitations
- ✅ Pages Tree + Permissions
- ❌ Block Editor (Wave 06)
- ❌ AI (Wave 20)
- ❌ Billing (Wave 12)

## الخطوة التالية

بناء `apps/web/src/` — Auth screens + Workspace screens + API routes.
