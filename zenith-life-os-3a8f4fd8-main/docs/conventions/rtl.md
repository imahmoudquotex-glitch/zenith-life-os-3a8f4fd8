# RTL Strategy — Wave 04

## Overview

Zenith is Arabic-first. `dir="rtl"` is set on the `<html>` element by the I18nProvider.

## Rules

### CSS Logical Properties

Always use CSS logical properties. Never use directional properties:

| ❌ Prohibited | ✅ Required |
|---|---|
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

### Tailwind Utilities

| ❌ Prohibited | ✅ Required |
|---|---|
| `pl-4`, `pr-4` | `ps-4`, `pe-4` |
| `ml-2`, `mr-2` | `ms-2`, `me-2` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

### Icons

- Use semantic direction icons: `ArrowRight` = forward in RTL context
- For chevron navigation: `ArrowLeft` = "go forward" in RTL layout
- Avoid `ChevronRight` without wrapping in RTL-aware context

### Number & Date Formatting

```ts
// Numbers
new Intl.NumberFormat('ar-EG').format(value)

// Dates
new Intl.DateTimeFormat('ar-EG', { timeZone: userTimezone }).format(date)
```

### Bidi Text

Wrap user-generated content that might contain mixed languages:
```html
<bdi>{userContent}</bdi>
```

Email/URL inputs get `dir="ltr"` locally:
```html
<input dir="ltr" type="email" ... />
```

## I18n Provider

`src/lib/i18n.tsx` — `I18nProvider` sets `html.dir` and `html.lang` reactively.

Locale is stored in `localStorage` (acceptable for Vite SPA — no SSR FOUC risk here).
