/**
 * Service Worker — Zenith Life OS
 * Strict security policy as per ADR-0003 / Wave 03 plan.
 *
 * DENY_LIST: These paths are NEVER cached. Always network.
 * PRECACHE:  App shell — cached on install.
 * SWR:       Static assets — Stale-While-Revalidate.
 */

// ─── NetworkOnly deny list ────────────────────────────────────────────────────
const DENY_LIST = [
  '/api/',
  '/auth/',
  '/vault/',
  '/account/',
  '/api/ai/',
  '/api/billing/',
  '/api/webhooks/',
  '/api/csrf',
  '/api/csp-report',
  '/api/push/',
];

// ─── App shell precache ───────────────────────────────────────────────────────
const CACHE_NAME = 'zenith-shell-v1';
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
];

// ─── Type helpers ─────────────────────────────────────────────────────────────
declare const self: ServiceWorkerGlobalScope;

// ─── Install: precache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache only the app shell — not API responses
      await cache.addAll(PRECACHE_ASSETS);
      // Take control immediately
      await (self as ServiceWorkerGlobalScope).skipWaiting();
    }),
  );
});

// ─── Activate: cleanup old caches ────────────────────────────────────────────
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }
      await (self as ServiceWorkerGlobalScope).clients.claim();
    }),
  );
});

// ─── Fetch: routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // RULE 1: NetworkOnly for sensitive paths — NO exceptions
  const isDenied = DENY_LIST.some((path) => url.pathname.startsWith(path));
  if (isDenied) {
    // Pass through, no cache interaction
    return;
  }

  // RULE 2: Never cache responses with Authorization or Set-Cookie
  // (handled in put helper below)

  // RULE 3: Navigation requests — serve from cache, fallback to network, fallback to /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/') ?? caches.match('/offline') ?? fetch(request),
      ),
    );
    return;
  }

  // RULE 4: Stale-while-revalidate for static assets
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: network only
});

// ─── Background sync — outbox ─────────────────────────────────────────────────
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'zenith-outbox-sync') {
    event.waitUntil(syncOutbox());
  }
});

async function syncOutbox(): Promise<void> {
  // Outbox sync handled by packages/offline/src/sync.ts in the client
  // SW just triggers the event — actual DB write happens in client context
  const clients = await (self as ServiceWorkerGlobalScope).clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({ type: 'ZENITH_OUTBOX_SYNC' });
  }
}

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() as { title?: string; body?: string; url?: string } | null;
  if (!data) return;

  const title = data.title ?? 'Zenith';
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: data.url ?? '/' },
    // No PII in notification payload
  };

  event.waitUntil(
    (self as ServiceWorkerGlobalScope).registration.showNotification(title, options),
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? '/';
  event.waitUntil(
    (self as ServiceWorkerGlobalScope).clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        return (self as ServiceWorkerGlobalScope).clients.openWindow(url);
      }),
  );
});

// ─── Subscription change ──────────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event: Event) => {
  // Notify the client to re-subscribe
  const clients$ = (self as ServiceWorkerGlobalScope).clients.matchAll({ type: 'window' });
  (event as ExtendableEvent).waitUntil(
    clients$.then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ type: 'ZENITH_PUSH_RESUBSCRIBE' });
      }
    }),
  );
});

// ─── Stale-While-Revalidate helper ────────────────────────────────────────────
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    // Only cache safe responses without sensitive headers
    if (
      response.ok &&
      !response.headers.has('authorization') &&
      !response.headers.has('set-cookie')
    ) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached ?? networkFetch;
}

export {};
