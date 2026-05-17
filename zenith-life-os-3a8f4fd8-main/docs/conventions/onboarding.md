# Onboarding Wizard — Wave 04 Conventions

## Overview

Multi-step onboarding wizard at `/onboarding`. Shown to every new user after email verification. Completes before access to the main app.

## Steps

| # | Step | Key Action |
|---|---|---|
| 1 | `locale` | Select language (ar/en). Sets `html.dir` + `html.lang`. |
| 2 | `profile` | Enter display name (2–60 chars). |
| 3 | `timezone` | Select IANA timezone (auto-detected or manual). |
| 4 | `done` | Saves all data + ensurePersonalWorkspace + marks completed. |

## Persistence

After each step, state is upserted to `onboarding_state` table:
```ts
{ user_id, step, payload: { locale, display_name, timezone }, updated_at }
```

## ensurePersonalWorkspace (Z2 — W01 contract)

On completion, the wizard checks if the user has a personal workspace. If not, creates one:
```ts
supabase.from('workspaces').insert({
  owner_id: user.id,
  name: `مساحة ${displayName}`,
  is_personal: true,
  locale,
  timezone,
})
```

## Accessibility

- Step indicator has `role="progressbar"` with `aria-valuenow` / `aria-valuemax`
- Each step region has `role="region"` + `aria-label`
- All buttons have `focus-visible` rings
- Keyboard nav: Tab/Shift+Tab/Enter through steps

## Rules

- Steps are skippable (defaults applied)
- User can go back and change values
- No step is required except completing the full flow
- After completion → redirect to `/dashboard`
