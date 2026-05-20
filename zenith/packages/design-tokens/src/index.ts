/**
 * @zenith/design-tokens — Dark-only design token system.
 * ADR-0010: Dark mode ONLY. No light theme tokens.
 * check:dark-only-tokens enforces this in CI.
 */

// Color palette — HSL dark tokens only
export const colors = {
  // Background layers
  bgBase:      'hsl(222 20% 8%)',
  bgElevated:  'hsl(222 18% 11%)',
  bgOverlay:   'hsl(222 16% 14%)',
  bgSurface:   'hsl(222 14% 17%)',

  // Text
  textPrimary:   'hsl(222 10% 95%)',
  textSecondary: 'hsl(222 8% 65%)',
  textMuted:     'hsl(222 6% 45%)',
  textDisabled:  'hsl(222 4% 30%)',

  // Brand
  brandPrimary:  'hsl(265 80% 65%)',
  brandSecondary:'hsl(215 75% 60%)',
  brandAccent:   'hsl(180 70% 55%)',

  // Semantic
  success: 'hsl(145 65% 42%)',
  warning: 'hsl(38 90% 55%)',
  error:   'hsl(0 75% 55%)',
  info:    'hsl(215 80% 55%)',

  // Borders
  borderDefault: 'hsl(222 12% 20%)',
  borderStrong:  'hsl(222 12% 28%)',
  borderFocus:   'hsl(265 80% 65%)',
} as const

// Spacing scale (4px base)
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

// Typography
export const typography = {
  fontFamily: "'Inter', 'Cairo', system-ui, sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
  fontSizes: {
    xs:   '11px',
    sm:   '13px',
    base: '15px',
    lg:   '17px',
    xl:   '20px',
    '2xl':'24px',
    '3xl':'30px',
    '4xl':'36px',
  },
  lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
  fontWeights: { normal: '400', medium: '500', semibold: '600', bold: '700' },
} as const

// Radii
export const radii = {
  sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px',
} as const

// Shadows (dark-optimized)
export const shadows = {
  sm: '0 1px 3px hsl(222 30% 4% / 0.4)',
  md: '0 4px 12px hsl(222 30% 4% / 0.5)',
  lg: '0 8px 24px hsl(222 30% 4% / 0.6)',
  xl: '0 16px 48px hsl(222 30% 4% / 0.7)',
} as const

export type ColorToken   = keyof typeof colors
export type SpacingToken = keyof typeof spacing
