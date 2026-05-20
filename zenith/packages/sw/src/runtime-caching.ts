// packages/sw/src/runtime-caching.ts
// Wave: W03 — Service Worker runtime caching config

import { shouldNeverCache } from './deny-list';

export type CacheStrategy = 'NetworkOnly' | 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';

export type CacheRule = {
  name: string;
  match: (url: URL) => boolean;
  strategy: CacheStrategy;
  cacheName?: string;
  networkTimeoutSeconds?: number;
  maxEntries?: number;
  maxAgeSeconds?: number;
};

/**
 * Runtime caching rules — evaluated in order. First match wins.
 */
export const RUNTIME_CACHE_RULES: ReadonlyArray<CacheRule> = [
  // 1. NEVER cache sensitive paths
  {
    name: 'deny-list',
    match: (url) => shouldNeverCache(url.pathname),
    strategy: 'NetworkOnly',
  },
  // 2. API responses: NetworkFirst with 5s timeout
  {
    name: 'api-cache',
    match: (url) => /^\/api\//.test(url.pathname),
    strategy: 'NetworkFirst',
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    maxEntries: 100,
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
  // 3. Next.js static assets: CacheFirst (immutable hash in filename)
  {
    name: 'next-static',
    match: (url) => /\/_next\/static\//.test(url.pathname),
    strategy: 'CacheFirst',
    cacheName: 'next-static',
    maxEntries: 500,
  },
  // 4. Images: CacheFirst with 7-day TTL
  {
    name: 'images',
    match: (url) => /\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(url.pathname),
    strategy: 'CacheFirst',
    cacheName: 'images',
    maxEntries: 200,
    maxAgeSeconds: 7 * 24 * 60 * 60,
  },
  // 5. Fonts: CacheFirst with 30-day TTL
  {
    name: 'fonts',
    match: (url) => /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname),
    strategy: 'CacheFirst',
    cacheName: 'fonts',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60,
  },
  // 6. Web manifest: StaleWhileRevalidate
  {
    name: 'manifest',
    match: (url) => /manifest\.webmanifest$/.test(url.pathname),
    strategy: 'StaleWhileRevalidate',
    cacheName: 'manifest',
  },
];
