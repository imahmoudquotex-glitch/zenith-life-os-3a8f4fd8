/**
 * Zenith Design Tokens — W04
 * Single source of truth. لا تعدّل الـ styles.css مباشرة.
 */
export const tokens = {
  colors: {
    background:      '#030504',
    foreground:      '#F4F7F5',
    muted:           '#647067',
    mutedForeground: '#A7B3AB',
    accent:          '#4ADE80',
    primary:         '#22C55E',
    border:          'rgba(255,255,255,0.08)',
    glass:           'rgba(10,16,13,0.62)',
    glassStrong:     'rgba(13,20,16,0.92)',
  },
  fonts: {
    arabic: '"Cairo", sans-serif',
    latin:  '"Inter", "Cairo", sans-serif',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    sidebar: '240px',
    topbar:  '56px',
  },
} as const;

export type DesignTokens = typeof tokens;
