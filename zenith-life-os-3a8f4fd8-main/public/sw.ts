/**
 * Wave 03 — Service Worker
 * Offline-first with deny-list for sensitive routes.
 * SECURITY: Never cache auth, vault, or admin routes.
 */

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'zenith-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html',
];

// SECURITY: Never cache these paths
const DENY_LIST = [
  '/api/',
  '/auth/',
  '/vault/',
  '/admin/',
  '/donate/',
  '/settings/',
];

function isDenied(url: URL): boolean {
  return DENY_LIST.some(prefix => url.pathname.startsWith(prefix));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and denied routes
  if (event.request.method !== 'GET' || isDenied(url)) {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html') as Promise<Response>;
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
