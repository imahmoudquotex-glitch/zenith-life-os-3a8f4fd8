// packages/sw/src/update.ts
// Wave: W03 — Service Worker update flow (manual approval only, no auto skipWaiting)

/**
 * Post SKIP_WAITING message to waiting SW.
 * Only called after user clicks "Update" in the toast.
 */
export function triggerSwUpdate(waitingWorker: ServiceWorker): void {
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Register a callback for when a new SW is waiting.
 * Returns cleanup function.
 */
export function onSwUpdateReady(
  registration: ServiceWorkerRegistration,
  onReady: (waiting: ServiceWorker) => void,
): () => void {
  const check = () => {
    if (registration.waiting) {
      onReady(registration.waiting);
    }
  };

  // Check immediately
  check();

  // Also check on updatefound
  const onUpdateFound = () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        onReady(installing);
      }
    });
  };

  registration.addEventListener('updatefound', onUpdateFound);

  return () => {
    registration.removeEventListener('updatefound', onUpdateFound);
  };
}
