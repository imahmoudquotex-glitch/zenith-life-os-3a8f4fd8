import type { NextConfig } from 'next';

/**
 * Zenith Next.js Config
 * Phase 00 invariants:
 *  - Security headers (CSP via middleware, HSTS, etc.)
 *  - Desktop PWA: min 1024×640
 *  - Dark-only (no light theme)
 */
const nextConfig: NextConfig = {
  /**
   * Strict mode catches common bugs early.
   */
  reactStrictMode: true,

  /**
   * Turbopack (stable in Next 15)
   */
  // turbopack: {},

  /**
   * Output standalone for Docker/edge deployments.
   */
  // output: 'standalone',

  /**
   * Experimental: partial prerendering + server actions
   */
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  /**
   * Security headers — layered defence with middleware CSP.
   * Middleware sets per-request nonce CSP; these are fallback static headers.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS — 2 years, preload
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Clickjacking protection
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()',
          },
          // CORP / COOP
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      // Service worker — no-cache
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
      // Manifest
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      // PWA icons — long cache
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  /**
   * Image domains — only self + Supabase storage.
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },

  /**
   * Bundle analyser (enable via ANALYZE=true)
   */
  // ...(process.env.ANALYZE === 'true' && require('@next/bundle-analyzer')()({})),
};

export default nextConfig;
