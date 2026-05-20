/**
 * Zenith Service Worker — Wave 03
 * 
 * Rules:
 * - Sensitive paths → NetworkOnly (NEVER cached)
 * - Static assets → CacheFirst
 * - API (non-sensitive) → NetworkFirst with 5s timeout
 * - No eval, no new Function, no importScripts
 * - No caching of responses with Authorization or Set-Cookie headers
 */

'use strict';

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `zenith-static-${CACHE_VERSION}`;
const API_CACHE = `zenith-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `zenith-images-${CACHE_VERSION}`;

// ─── NetworkOnly deny-list (NEVER cache these) ────────────────────────────────
const NEVER_CACHE = [
  /^\/api\//,
  /^\/auth\//,
  /^\/vault\//,
  /^\/account\//,
  /^\/settings\/security/,
  /^\/api\/v1\//,
  /^\/api\/ai\//,
  /^\/api\/billing\//,
  /^\/api\/webhooks\//,
  /^\/api\/csrf$/,
  /^\/api\/csp-report$/,
  /^\/api\/push\//,
  /^\/api\/export\//,
  /^\/api\/import\//,
  /^\/api\/api-keys\//,
];

// ─── App shell precache URLs ──────────────────────────────────────────────────
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shouldNeverCache(pathname) {
  return NEVER_CACHE.some((rx) => rx.test(pathname));
}

function hasSensitiveHeaders(response) {
  return (
    response.headers.has('Authorization') ||
    response.headers.has('Set-Cookie')
  );
}

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-fatal: precache may fail in dev
      })
    )
  );
  // Do NOT call skipWaiting() — user must approve update
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== STATIC_CACHE && k !== API_CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  const { pathname } = url;

  // 1. NEVER cache sensitive paths
  if (shouldNeverCache(pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Next.js static assets — CacheFirst
  if (pathname.startsWith('/_next/static/') || /\.(png|jpg|jpeg|webp|svg|ico|gif|woff2?)$/i.test(pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok && !hasSensitiveHeaders(response)) {
            const cacheName = /\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(pathname)
              ? IMAGE_CACHE
              : STATIC_CACHE;
            caches.open(cacheName).then((c) => c.put(event.request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Navigation requests — NetworkFirst with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/offline').then((r) => r || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // 4. Default: network pass-through
  event.respondWith(fetch(event.request));
});

// ─── Update flow (manual approval) ───────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Background sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'zenith-outbox-sync') {
    event.waitUntil(
      // Notify all clients to run sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'BACKGROUND_SYNC_READY' })
        );
      })
    );
  }
});
