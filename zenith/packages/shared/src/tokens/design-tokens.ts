/**
 * Zenith Design Tokens
 * Phase 00 Invariant INV-02: Dark Mode Invariant
 * These tokens are the single source of truth for all UI colors.
 */

export const tokens = {
  // ─── Background ──────────────────────────────────
  colors: {
    bg: {
      canvas: '#0a0a0a',      // deepest layer
      surface: '#131313',     // cards, panels
      elevated: '#1c1c1c',    // popovers, modals
      hover: '#262626',       // interactive hover
      active: '#2e2e2e',      // pressed state
    },

    // ─── Text ─────────────────────────────────────────
    text: {
      primary: '#fafafa',
      secondary: '#a3a3a3',
      tertiary: '#737373',
      disabled: '#525252',
      inverse: '#0a0a0a',
    },

    // ─── Accent ───────────────────────────────────────
    accent: {
      neon: '#4ade80',         // primary action, success
      neonHover: '#22c55e',
      neonMuted: 'rgba(74, 222, 128, 0.15)',

      info: '#38bdf8',         // info, links
      infoHover: '#0ea5e9',

      warning: '#fbbf24',      // warnings
      warningHover: '#f59e0b',

      danger: '#ef4444',       // destructive
      dangerHover: '#dc2626',
      dangerMuted: 'rgba(239, 68, 68, 0.15)',

      purple: '#a78bfa',       // habits, streaks
      purpleHover: '#8b5cf6',

      amber: '#f59e0b',        // finance
      amberHover: '#d97706',
    },

    // ─── Border ───────────────────────────────────────
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.10)',
      strong: 'rgba(255, 255, 255, 0.16)',
      focus: '#4ade80',
    },

    // ─── Overlay ──────────────────────────────────────
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.60)',
      glass: 'rgba(19, 19, 19, 0.80)',
    },
  },

  // ─── Typography ──────────────────────────────────
  fonts: {
    sans: '"Inter Variable", "Noto Kufi Arabic Variable", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  // ─── Spacing ──────────────────────────────────────
  spacing: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
  },

  // ─── Radii ──────────────────────────────────────
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // ─── Shadows ──────────────────────────────────────
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    glow: {
      neon: '0 0 20px rgba(74, 222, 128, 0.3)',
      danger: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
  },

  // ─── Animation ──────────────────────────────────
  animation: {
    fast: '100ms',
    normal: '200ms',   // max per INV-02
    slow: '300ms',
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },

  // ─── Breakpoints ─────────────────────────────────
  breakpoints: {
    min: '1024px',     // minimum supported
    optimal: '1440px', // design target
    wide: '1920px',
  },

  // ─── Z-index ──────────────────────────────────────
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    toast: 60,
    commandPalette: 70,
  },
} as const

export type DesignTokens = typeof tokens
