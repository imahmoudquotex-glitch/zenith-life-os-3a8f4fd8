/**
 * @zenith/design-tokens — Dark-only design token system.
 * ADR-0010: Dark mode ONLY. No light theme tokens.
 * check:dark-only-tokens enforces this in CI.
 *
 * Canonical hex values from Phase 00 invariants:
 *   bgCanvas:      #0a0a0a  (--bg-canvas)
 *   bgSurface:     #131313  (--bg-surface)
 *   bgElevated:    #1c1c1c  (--bg-elevated)
 *   textPrimary:   #fafafa  (--text-primary)
 *   textSecondary: #a3a3a3  (--text-secondary)
 *   accentNeon:    #4ade80  (--accent-neon)
 *   accentDanger:  #ef4444  (--accent-danger)
 */

// ─── Colors (Phase 00 canonical values) ───────────────────────────────────────
export const colors = {
  // Background layers
  bgCanvas:   '#0a0a0a',
  bgSurface:  '#131313',
  bgElevated: '#1c1c1c',
  bgOverlay:  '#242424',

  // Text
  textPrimary:   '#fafafa',
  textSecondary: '#a3a3a3',
  textMuted:     '#6b7280',
  textDisabled:  '#404040',

  // Accent — neon green is the primary brand accent
  accentNeon:    '#4ade80',
  accentBlue:    '#60a5fa',
  accentPurple:  '#a78bfa',
  accentDanger:  '#ef4444',
  accentWarning: '#f59e0b',
  accentInfo:    '#38bdf8',

  // Borders
  borderDefault: '#262626',
  borderStrong:  '#3f3f3f',
  borderFocus:   '#4ade80',

  // Legacy aliases (kept for backwards compat with existing packages)
  /** @deprecated use bgCanvas */ bgBase: '#0a0a0a',
  /** @deprecated use accentPurple */ brandPrimary: '#a78bfa',
  /** @deprecated use accentBlue */ brandSecondary: '#60a5fa',
  /** @deprecated use accentNeon */ brandAccent: '#4ade80',
  /** @deprecated use accentDanger */ error: '#ef4444',
  /** @deprecated use accentWarning */ warning: '#f59e0b',
  /** @deprecated use accentNeon */ success: '#4ade80',
  /** @deprecated use accentInfo */ info: '#38bdf8',
} as const

// ─── Spacing scale (4px base) ─────────────────────────────────────────────────
export const spacing = {
  '0':  '0px',
  '1':  '4px',
  '2':  '8px',
  '3':  '12px',
  '4':  '16px',
  '5':  '20px',
  '6':  '24px',
  '8':  '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
} as const

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontFamily:     "'Inter', 'Cairo', system-ui, sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
  fontSizes: {
    xs:   '11px',
    sm:   '13px',
    base: '15px',
    lg:   '17px',
    xl:   '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  lineHeights:  { tight: '1.25', normal: '1.5', relaxed: '1.75' },
  fontWeights:  { normal: '400', medium: '500', semibold: '600', bold: '700' },
} as const

// ─── Radii ────────────────────────────────────────────────────────────────────
export const radii = {
  sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px',
} as const

// ─── Shadows (dark-optimised) ─────────────────────────────────────────────────
export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,.5)',
  md: '0 4px 12px rgba(0,0,0,.6)',
  lg: '0 8px 24px rgba(0,0,0,.7)',
  xl: '0 16px 48px rgba(0,0,0,.8)',
} as const

// ─── Motion (Phase 00: max 200ms) ─────────────────────────────────────────────
export const motion = {
  fast:   '100ms ease',
  normal: '150ms ease',
  slow:   '200ms ease',
} as const

// ─── Z-index ──────────────────────────────────────────────────────────────────
export const zIndex = {
  base:    0,
  overlay: 100,
  modal:   200,
  tooltip: 300,
  toast:   400,
} as const

// ─── Type exports ─────────────────────────────────────────────────────────────
export type ColorToken   = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type RadiiToken   = keyof typeof radii
export type ShadowToken  = keyof typeof shadows
