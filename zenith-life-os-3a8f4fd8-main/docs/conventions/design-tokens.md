# Design Tokens — Wave 04 Conventions

## Source of Truth

`src/lib/design-tokens.ts` — single source of truth for all design values.

CSS variables are embedded in `src/styles.css` via `@theme inline`.

## Token Categories

| Category | File | Notes |
|---|---|---|
| Colors | `design-tokens.ts → colors` | semantic, theme-aware |
| Typography | `design-tokens.ts → typography` | Arabic-first |
| Spacing | `design-tokens.ts → spacing` | 4px base grid |
| Radius | `design-tokens.ts → radius` | 6px → 9999px |
| Shadow | `design-tokens.ts → shadow` | sm/md/lg/xl |
| Motion | `design-tokens.ts → motion` | duration + easing |
| Breakpoints | `design-tokens.ts → breakpoints` | sm→2xl |
| Z-index | `design-tokens.ts → zIndex` | layered scale |

## Usage Rules

- ✅ Use CSS variables: `var(--accent)`, `var(--background)`, `var(--foreground)`
- ✅ Use Tailwind v4 utilities: `text-foreground`, `bg-background`, `border-border`
- ❌ Never hardcode hex values in components
- ❌ Never create a parallel design-tokens package

## Dark Mode

Dark mode is the **only** supported theme. The `color-scheme: dark` is set globally.

```css
:root {
  color-scheme: dark;
}
```

No light mode. Any `light:` Tailwind prefix is prohibited.

## Typography

- Arabic: Cairo (primary), Tajawal (fallback)
- Latin: Inter
- Mono: JetBrains Mono
- All fonts use `font-display: swap`

## Tailwind Integration

Tailwind v4 with `@theme inline` reads CSS variables directly.
No `tailwind.config.ts` needed for token definitions — they live in `styles.css`.
